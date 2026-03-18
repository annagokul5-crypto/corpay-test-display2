import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { FileUpload } from '../FileUpload';
import { toast } from 'sonner';
import { Upload, FileText } from 'lucide-react';
import { api } from '@/app/services/api';

export function PaymentsPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!excelFile) {
      toast.error('Please select a file');
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', excelFile);

    setIsUploading(true);
    try {
      await api.post('admin/payments/upload', formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 120000,
      });
      toast.success('Payments data uploaded successfully');
      setExcelFile(null);
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.message || 'Upload failed';
      toast.error(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Payments Data</h1>
        <p className="text-gray-400">Upload daily payment processing data</p>
      </div>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Upload Payments Excel</CardTitle>
          <CardDescription className="text-gray-400">
            Upload Excel file containing today's payment processing data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            selectedFile={excelFile}
            onFileSelect={setExcelFile}
            onClear={() => setExcelFile(null)}
            label="Select Payments Excel File"
          />

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-pink-500 mt-0.5" />
              <div>
                <h4 className="text-white mb-2">Expected Excel Format:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Column A: Transaction ID</li>
                  <li>• Column B: Amount Processed</li>
                  <li>• Column C: Number of Transactions</li>
                  <li>• Column D: Processing Date</li>
                  <li>• Column E: Status</li>
                </ul>
              </div>
            </div>

            <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
              <p className="text-sm text-pink-300">
                <strong>Note:</strong> The system will automatically calculate total amount processed and transaction count from the uploaded data.
              </p>
            </div>
          </div>

          <Button 
            onClick={handleUpload}
            disabled={!excelFile || isUploading}
            className="w-full bg-pink-600 hover:bg-pink-700"
            size="lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Payments Data'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-12-24', amount: '₹42.8 Cr', transactions: '19,320' },
              { date: '2024-12-23', amount: '₹41.2 Cr', transactions: '18,450' },
              { date: '2024-12-22', amount: '₹39.5 Cr', transactions: '17,890' }
            ].map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white">{upload.date}</p>
                  <p className="text-sm text-gray-400">
                    {upload.amount} • {upload.transactions} transactions
                  </p>
                </div>
                <span className="px-3 py-1 rounded text-xs bg-green-500/20 text-green-300">
                  Processed
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
