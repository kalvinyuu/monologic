
export default function DataMarketplace() {
  const availableData = [
    { id: 1, name: 'Pre-processed Financial Data', price: 500 },
    { id: 2, name: 'Curated Codebase for AI Training', price: 1000 },
    { id: 3, name: 'Medical Imaging Dataset', price: 750 },
  ];

  return (
    <div className="w-full max-w-lg p-4 text-white border border-gray-200 rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">Data Marketplace</h3>
      <ul className="space-y-2">
        {availableData.map((data) => (
          <li key={data.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
            <span className="text-gray-900">{data.name}</span>
            <span className="font-semibold text-gray-800">{data.price} MONO</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
