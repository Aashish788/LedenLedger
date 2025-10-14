import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import * as XLSX from 'xlsx';

interface CustomerRow {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  openingBalance?: number;
  balanceType: "credit" | "debit";
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: CustomerRow[];
}

export default function BulkImportCustomers() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'uploading' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Generate sample Excel template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        Name: "John Doe",
        Phone: "9876543210",
        Email: "john@example.com",
        Address: "123 Main Street, City",
        "GST Number": "22AAAAA0000A1Z5",
        "Opening Balance": 5000,
        "Balance Type": "credit"
      },
      {
        Name: "Jane Smith",
        Phone: "9876543211",
        Email: "jane@example.com",
        Address: "456 Park Avenue, City",
        "GST Number": "",
        "Opening Balance": 0,
        "Balance Type": "credit"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Name
      { wch: 15 }, // Phone
      { wch: 25 }, // Email
      { wch: 30 }, // Address
      { wch: 20 }, // GST Number
      { wch: 15 }, // Opening Balance
      { wch: 15 }  // Balance Type
    ];

    XLSX.writeFile(workbook, "customer_import_template.xlsx");
    toast.success("Sample template downloaded!", {
      description: "Fill in your customer details and upload the file."
    });
  };

  // Validate Excel data
  const validateExcelData = (data: any[]): ValidationResult => {
    const errors: string[] = [];
    const validatedData: CustomerRow[] = [];

    if (!data || data.length === 0) {
      return { valid: false, errors: ["Excel file is empty or invalid"] };
    }

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because Excel is 1-indexed and has header row

      // Required field validation
      if (!row.Name || row.Name.trim() === "") {
        errors.push(`Row ${rowNumber}: Name is required`);
        return;
      }

      if (!row.Phone || row.Phone.toString().trim() === "") {
        errors.push(`Row ${rowNumber}: Phone number is required`);
        return;
      }

      // Phone validation (basic)
      const phoneStr = row.Phone.toString().replace(/\D/g, '');
      if (phoneStr.length < 10) {
        errors.push(`Row ${rowNumber}: Phone number must be at least 10 digits`);
        return;
      }

      // Balance type validation
      const balanceType = row["Balance Type"]?.toString().toLowerCase();
      if (balanceType && balanceType !== "credit" && balanceType !== "debit") {
        errors.push(`Row ${rowNumber}: Balance Type must be either 'credit' or 'debit'`);
        return;
      }

      // Email validation (if provided)
      if (row.Email && row.Email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.Email)) {
          errors.push(`Row ${rowNumber}: Invalid email format`);
          return;
        }
      }

      // Create validated customer object
      const customer: CustomerRow = {
        name: row.Name.trim(),
        phone: phoneStr,
        email: row.Email?.trim() || undefined,
        address: row.Address?.trim() || undefined,
        gstNumber: row["GST Number"]?.trim() || undefined,
        openingBalance: parseFloat(row["Opening Balance"] || 0),
        balanceType: (balanceType || "credit") as "credit" | "debit"
      };

      validatedData.push(customer);
    });

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, errors: [], data: validatedData };
  };

  // Process Excel file
  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('validating');
    setUploadProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setUploadProgress(30);

      // Validate data
      const validation = validateExcelData(jsonData);
      
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        setUploadStatus('error');
        setIsProcessing(false);
        toast.error("Validation failed", {
          description: `Found ${validation.errors.length} error(s) in your file.`
        });
        return;
      }

      setUploadProgress(50);
      setUploadStatus('uploading');

      // Simulate uploading to database
      // TODO: Replace with actual Supabase insertion
      await simulateBulkUpload(validation.data!);

      setUploadProgress(100);
      setUploadStatus('success');
      setSuccessCount(validation.data!.length);
      setFailedCount(0);

      toast.success("Upload successful!", {
        description: `${validation.data!.length} customers imported successfully.`
      });

    } catch (error) {
      console.error("Error processing file:", error);
      setUploadStatus('error');
      setValidationErrors([`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      toast.error("Upload failed", {
        description: "An error occurred while processing your file."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate bulk upload (replace with actual Supabase code)
  const simulateBulkUpload = async (customers: CustomerRow[]) => {
    // Simulate progress
    for (let i = 0; i < customers.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const progress = 50 + ((i + 1) / customers.length) * 50;
      setUploadProgress(progress);
      
      // TODO: Insert into Supabase
      // const { error } = await supabase.from('customers').insert({
      //   name: customers[i].name,
      //   phone: customers[i].phone,
      //   email: customers[i].email,
      //   address: customers[i].address,
      //   gst_number: customers[i].gstNumber,
      //   opening_balance: customers[i].openingBalance,
      //   balance_type: customers[i].balanceType
      // });
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Invalid file type", {
        description: "Please upload an Excel file (.xlsx, .xls) or CSV file."
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 5MB."
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    setValidationErrors([]);
    setUploadProgress(0);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle upload button click
  const handleUpload = () => {
    if (selectedFile) {
      processExcelFile(selectedFile);
    }
  };

  // Reset upload
  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setValidationErrors([]);
    setUploadProgress(0);
    setSuccessCount(0);
    setFailedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/customers')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Bulk Import</h1>
        </div>

        {/* Instructions Section */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-3">Bulk upload customers in 3 Simple steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <h3 className="font-semibold text-sm">Step 1:</h3>
                </div>
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <span 
                      className="text-primary font-medium cursor-pointer hover:underline"
                      onClick={downloadSampleTemplate}
                    >
                      Download
                    </span>
                    {" "}the Sample Excel sheet format
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <h3 className="font-semibold text-sm">Step 2:</h3>
                </div>
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Upload your Excel sheet with your customers details by clicking upload excel sheet button
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <h3 className="font-semibold text-sm">Step 3:</h3>
                </div>
                <p className="text-xs leading-relaxed">
                  Click on <span className="font-semibold">"Upload Button"</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upload Status Section */}
        <div>
          <h2 className="text-base font-semibold mb-3">Bulk upload status</h2>
          
          <Card className="border">
            <CardContent className="py-10">
              {/* No File State */}
              {!selectedFile && uploadStatus === 'idle' && (
                <div className="text-center">
                  <div className="w-52 h-52 mx-auto mb-5">
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                      {/* Illustration elements */}
                      <ellipse cx="200" cy="250" rx="100" ry="15" fill="#e5e7eb" opacity="0.5"/>
                      
                      {/* Person sitting */}
                      <circle cx="180" cy="160" r="25" fill="#d97706"/>
                      <path d="M 180 185 Q 160 200 150 230 L 150 250 L 165 250 L 170 220 L 190 220 L 195 250 L 210 250 L 210 230 Q 200 200 180 185" fill="#0d9488"/>
                      <rect x="190" y="195" width="15" height="60" rx="5" fill="#7c3aed" transform="rotate(15 190 195)"/>
                      
                      {/* Laptop */}
                      <rect x="130" y="215" width="80" height="50" rx="3" fill="#1f2937"/>
                      <rect x="135" y="220" width="70" height="35" fill="#374151"/>
                      <line x1="130" y1="215" x2="150" y2="265" stroke="#1f2937" strokeWidth="3"/>
                      <line x1="210" y1="215" x2="190" y2="265" stroke="#1f2937" strokeWidth="3"/>
                      
                      {/* Floating elements */}
                      <circle cx="280" cy="140" r="8" fill="#fbbf24"/>
                      <circle cx="300" cy="120" r="5" fill="#fbbf24" opacity="0.7"/>
                      
                      {/* Progress bar illustration */}
                      <rect x="240" y="200" width="100" height="8" rx="4" fill="#e5e7eb"/>
                      <rect x="240" y="200" width="40" height="8" rx="4" fill="#3b82f6"/>
                      
                      {/* Document/phone */}
                      <rect x="260" y="160" width="60" height="80" rx="8" fill="#ef4444"/>
                      <rect x="265" y="165" width="50" height="60" fill="#7c3aed"/>
                      <line x1="270" y1="175" x2="310" y2="175" stroke="#e5e7eb" strokeWidth="2"/>
                      <line x1="270" y1="185" x2="310" y2="185" stroke="#e5e7eb" strokeWidth="2"/>
                      <line x1="270" y1="195" x2="300" y2="195" stroke="#e5e7eb" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No File added</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Upload your Excel file to get started
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload excel sheet
                  </Button>
                </div>
              )}

              {/* File Selected State */}
              {selectedFile && uploadStatus === 'idle' && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">{selectedFile.name}</h3>
                  <p className="text-xs text-muted-foreground mb-5">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpload}
                      className="rounded-lg"
                      disabled={isProcessing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Process
                    </Button>
                  </div>
                </div>
              )}

              {/* Processing State */}
              {(uploadStatus === 'validating' || uploadStatus === 'uploading') && (
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                  <h3 className="text-base font-semibold mb-3">
                    {uploadStatus === 'validating' ? 'Validating data...' : 'Uploading customers...'}
                  </h3>
                  <Progress value={uploadProgress} className="mb-3" />
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress.toFixed(0)}% complete
                  </p>
                </div>
              )}

              {/* Success State */}
              {uploadStatus === 'success' && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-green-600">Upload Successful!</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    {successCount} customers imported successfully
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      className="rounded-lg"
                    >
                      Upload Another File
                    </Button>
                    <Button 
                      onClick={() => navigate('/customers')}
                      className="rounded-lg"
                    >
                      View Customers
                    </Button>
                  </div>
                </div>
              )}

              {/* Error State */}
              {uploadStatus === 'error' && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-red-600">Upload Failed</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Please fix the following errors and try again:
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 max-w-md mx-auto">
                    <div className="max-h-40 overflow-y-auto text-left">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="flex items-start gap-2 mb-1.5 text-xs">
                          <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-red-800">{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-lg"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Drag and Drop Zone (Alternative) */}
        {!selectedFile && uploadStatus === 'idle' && (
          <div className="mt-5">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Or drag and drop your Excel file here
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

