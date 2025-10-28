import React, { useState } from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import * as NodeSecureScanner from '@nodesecure/scanner';
import { runASTAnalysis } from 'js-x-ray';

interface CodebaseScannerProps {
  onScanComplete: (results: any) => void;
}

const CodebaseScanner: React.FC<CodebaseScannerProps> = ({ onScanComplete }) => {
  const [codebasePath, setCodebasePath] = useState('');
  const [status, setStatus] = useState('Enter codebase path to scan:');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [codebaseHash, setCodebaseHash] = useState<string | null>(null);

  // Helper to get error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };

  const handlePathSubmit = async (path: string) => {
    if (!path.trim()) {
      setStatus('Path cannot be empty.');
      return;
    }
    setCodebasePath(path);
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

      // 2. Perform automated security checks
      setStatus('Running @nodesecure/scanner...');
      const scannerResult = await NodeSecureScanner.cwd(path);

      setStatus('Running js-x-ray analysis...');
      const xRayResults: any[] = [];
      let totalWarnings = 0;
      
      // Run js-x-ray on each file individually
      for (const file of filesToScan.slice(0, 10)) { // Limit to first 10 files for performance
        try {
          const fileContent = await readFile(file, 'utf-8');
          const analysis = runASTAnalysis(fileContent);
          if (analysis.warnings.length > 0) {
            xRayResults.push({
              file,
              warnings: analysis.warnings
            });
            totalWarnings += analysis.warnings.length;
          }
        } catch (error) {
          // Skip files that can't be analyzed
          continue;
        }
      }

      const results = {
        hash,
        scanner: scannerResult,
        xRay: {
          filesAnalyzed: Math.min(filesToScan.length, 10),
          totalFiles: filesToScan.length,
          warnings: xRayResults,
          totalWarnings
        }
      };

      setScanResults(results);
      setStatus('Scan complete. Results displayed below.');
      onScanComplete(results);
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
      {!scanning && !scanResults && (
        <Box marginTop={1}>
          <Text>Path: </Text>
          <TextInput
            value={codebasePath}
            onChange={setCodebasePath}
            onSubmit={handlePathSubmit}
            placeholder="e.g., /path/to/your/codebase"
          />
        </Box>
      )}

      {codebaseHash && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>Codebase Hash (SHA256):</Text>
          <Text color="cyan">{codebaseHash}</Text>
        </Box>
      )}

      {scanResults && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>Scan Results:</Text>
          {scanResults.scanner && (
            <Box flexDirection="column" marginTop={1}>
              <Text>@nodesecure/scanner:</Text>
              <Text color="cyan">
                {scanResults.scanner.warnings?.length > 0 
                  ? `Found ${scanResults.scanner.warnings.length} security warnings.` 
                  : `Analysis complete.`}
              </Text>
            </Box>
          )}
          {scanResults.xRay && (
            <Box flexDirection="column" marginTop={1}>
              <Text>js-x-ray:</Text>
              <Text color="cyan">
                Analyzed {scanResults.xRay.filesAnalyzed} of {scanResults.xRay.totalFiles} files.
              </Text>
              <Text color="cyan">
                {scanResults.xRay.totalWarnings > 0 
                  ? `Found ${scanResults.xRay.totalWarnings} potential issues.` 
                  : `No issues found.`}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CodebaseScanner;
