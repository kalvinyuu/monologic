import React, { useState, useEffect } from 'react';
import { Text, Box, useFocus } from 'ink';
import TextInput from 'ink-text-input';
import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import { exec } from 'child_process'; // Import child_process for running external commands

interface CodebaseScannerProps {
  onScanComplete: (results: any) => void;
  onScannerActivityChange: (isActive: boolean) => void; // New prop
}

const CodebaseScanner: React.FC<CodebaseScannerProps> = ({ onScanComplete, onScannerActivityChange }) => {
  const [codebasePath] = useState(process.cwd()); // Automatically set to current working directory
  const [status, setStatus] = useState('Scanning current codebase...');
  const [scanning, setScanning] = useState(true); // Start scanning immediately
  const [scanResults, setScanResults] = useState<any>(null);
  const [codebaseHash, setCodebaseHash] = useState<string | null>(null);
  const [confirmSecurityScan, setConfirmSecurityScan] = useState(false);
  const [securityScanInput, setSecurityScanInput] = useState('');
  const [codeqlStatus, setCodeqlStatus] = useState('');
  const [semgrepStatus, setSemgrepStatus] = useState('');
  const [codeqlResults, setCodeqlResults] = useState<string | null>(null);
  const [semgrepResults, setSemgrepResults] = useState<string | null>(null);

  // Notify parent about scanner activity
  useEffect(() => {
    onScannerActivityChange(scanning || confirmSecurityScan);
  }, [scanning, confirmSecurityScan, onScannerActivityChange]);

  // Helper to get error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };

  // Use useEffect to trigger scan on component mount
  useEffect(() => {
    handlePathSubmit(codebasePath);
  }, [codebasePath]); // Rerun if codebasePath changes (though it's static here)

  const handleSecurityScanConfirmation = async (answer: string) => {
    if (answer.toLowerCase() === 'yes') {
      // Execute CodeQL and Semgrep
      setStatus('Running CodeQL and Semgrep analysis in background...');
      setCodeqlStatus('Running CodeQL...');
      setSemgrepStatus('Running Semgrep...');

      // CodeQL execution
      const codeqlDbPath = join(codebasePath, '.codeql-db');
      exec(`mkdir -p ${codeqlDbPath} && ~/Dev/tools/codeql/codeql/codeql database create ${codeqlDbPath} --language=javascript --command="bun install" --source-root=${codebasePath}`, (error, stdout, stderr) => {
        if (error) {
          setCodeqlStatus(`CodeQL database creation failed: ${error.message}`);
          return;
        }
        exec(`~/Dev/tools/codeql/codeql/codeql database analyze ${codeqlDbPath} codeql/javascript-queries --format=sarifv2.1.0 --output=${codebasePath}/codeql-results.sarif`, (error, stdout, stderr) => {
          if (error) {
            setCodeqlStatus(`CodeQL analysis failed: ${error.message}`);
            return;
          }
          setCodeqlStatus('CodeQL analysis complete.');
          setCodeqlResults(`${codebasePath}/codeql-results.sarif`);
        });
      });

      // Semgrep execution
      exec(`semgrep --config "p/javascript" --config "p/react" --config "p/typescript" --output ${codebasePath}/semgrep-results.json --json ${codebasePath}`, (error, stdout, stderr) => {
        if (error) {
          setSemgrepStatus(`Semgrep analysis failed: ${error.message}`);
          return;
        }
        setSemgrepStatus('Semgrep analysis complete.');
        setSemgrepResults(`${codebasePath}/semgrep-results.json`);
      });

    } else {
      setStatus('Security scan skipped.');
    }
    setConfirmSecurityScan(false); // Hide confirmation prompt
  };

  const handlePathSubmit = async (path: string) => {
    setScanning(true);
    setStatus('Scanning codebase...');
    setScanResults(null);
    setCodebaseHash(null);

    try {
      const filesToScan: string[] = [];
      const readFilesRecursively = async (directory: string) => {
        const entries = await readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(directory, entry.name);
          if (entry.isDirectory()) {
            // Skip node_modules and other common directories
            if (entry.name === 'node_modules' || entry.name === '.git') {
              continue;
            }
            await readFilesRecursively(fullPath);
          } else if (['.js', '.jsx', '.ts', '.tsx'].includes(extname(entry.name))) {
            filesToScan.push(fullPath);
          }
        }
      };

      await readFilesRecursively(path);

      if (filesToScan.length === 0) {
        setStatus('No JS/TS files found in the specified path.');
        setScanning(false);
        return;
      }

      // 1. Parse codebase and create signature (hash)
      setStatus('Hashing codebase...');
      let combinedContent = '';
      for (const file of filesToScan) {
        combinedContent += await readFile(file, 'utf-8');
      }
      const hash = createHash('sha256').update(combinedContent).digest('hex');
      setCodebaseHash(hash);
      setStatus(`Codebase Hashed: ${hash.substring(0, 16)}...`);

      const results = {
        hash
      };

      setScanResults(results);
      onScanComplete(results);
      setConfirmSecurityScan(true); // Prompt user for security scan
      setStatus('Initial scan complete. Do you want to run CodeQL and Semgrep analysis? (yes/no)');
    } catch (error) {
      setStatus(`Error during scan: ${getErrorMessage(error)}`);
    } finally {
      setScanning(false);
    }
  };

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="yellow" padding={1}>
      <Text bold color="yellow">Codebase Security Scanner</Text>
      <Box marginTop={1}>
        <Text>{status}</Text>
      </Box>


      {codebaseHash && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>Codebase Hash (SHA256):</Text>
          <Text color="cyan">{codebaseHash}</Text>
        </Box>
      )}

      {confirmSecurityScan && (
        <Box marginTop={1}>
          <Text>{status}</Text>
          <TextInput
            value={securityScanInput}
            onChange={setSecurityScanInput}
            onSubmit={handleSecurityScanConfirmation}
            placeholder="Type 'yes' or 'no'"
            focus={confirmSecurityScan} // Set focus when confirmSecurityScan is true
          />
        </Box>
      )}

      {codeqlStatus && (
        <Box marginTop={1}>
          <Text bold>CodeQL Status: </Text>
          <Text color="blue">{codeqlStatus}</Text>
        </Box>
      )}
      {codeqlResults && (
        <Box>
          <Text bold>CodeQL Results: </Text>
          <Text color="cyan">{codeqlResults}</Text>
        </Box>
      )}

      {semgrepStatus && (
        <Box marginTop={1}>
          <Text bold>Semgrep Status: </Text>
          <Text color="blue">{semgrepStatus}</Text>
        </Box>
      )}
      {semgrepResults && (
        <Box>
          <Text bold>Semgrep Results: </Text>
          <Text color="cyan">{semgrepResults}</Text>
        </Box>
      )}

      {scanResults && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>Scan Results:</Text>
        </Box>
      )}
    </Box>
  );
};

export default CodebaseScanner;
