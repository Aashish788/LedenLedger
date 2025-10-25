/**
 * Add/Edit Product Page - Industry-Grade Implementation
 * Complete form for creating and editing products/services with GST integration
 */

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useInventory, Product } from "@/contexts/InventoryContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const productCategories = [
  'Agriculture & Food Products',
  'Automotive & Parts',
  'Chemicals & Pharmaceuticals',
  'Clothing & Textiles',
  'Construction Materials',
  'Electronics & Technology',
  'Home & Furniture',
  'Healthcare & Medical',
  'Jewelry & Precious Metals',
  'Retail & Consumer Goods',
  'Sports & Recreation',
  'Others'
];

const serviceCategories = [
  'Accounting & Bookkeeping',
  'Advertising & Marketing',
  'Business Consulting',
  'Educational Services',
  'Financial Services',
  'Healthcare Services',
  'IT & Technology Services',
  'Legal Services',
  'Professional Services',
  'Others'
];

const productUnits = [
  'Piece (PCS)',
  'Kilogram (KG)',
  'Gram (GM)',
  'Liter (LTR)',
  'Milliliter (ML)',
  'Meter (MTR)',
  'Box',
  'Pack',
  'Dozen',
  'Set'
];

const serviceDurations = [
  'Per Hour',
  'Per Day',
  'Per Week',
  'Per Month',
  'Per Project',
  'Per Session',
  'Fixed Rate'
];

const gstRates = [
  { label: 'GST Free (0%)', value: 0, description: 'Essential items, agricultural products' },
  { label: 'Low Rate (5%)', value: 5, description: 'Daily essentials, medicines, food items' },
  { label: 'Standard Rate (18%)', value: 18, description: 'Most goods and services' },
  { label: 'Luxury Rate (40%)', value: 40, description: 'Luxury goods, sin goods' }
];

export default function AddProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { format: formatCurrency } = useCurrency();
  const { addProduct, updateProduct, getProduct } = useInventory();

  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);

  // Form state
  const [productType, setProductType] = useState<'Product' | 'Service'>('Product');
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState('10');
  const [taxRate, setTaxRate] = useState('18');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notForSale, setNotForSale] = useState(false);

  // Advanced fields
  const [brandName, setBrandName] = useState('');
  const [manufacturerName, setManufacturerName] = useState('');
  const [mrpPrice, setMrpPrice] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  // Load product data if editing
  useEffect(() => {
    if (isEditMode && id) {
      const product = getProduct(id);
      if (product) {
        setProductType(product.product_type || 'Product');
        setName(product.name);
        setSellingPrice(product.selling_price.toString());
        setPurchasePrice(product.cost_price.toString());
        setStock(product.quantity.toString());
        setUnit(product.unit);
        setCategory(product.category);
        setHsnCode(product.hsn_code || '');
        setBarcode(product.barcode || '');
        setSku(product.sku || '');
        setLowStockAlert(product.min_stock_level.toString());
        setTaxRate(product.tax_rate?.toString() || '0');
        setImage(product.image || '');
        setDescription(product.description || '');
        setTaxInclusive(product.tax_inclusive || false);
        setIsOnline(product.is_online || false);
        setNotForSale(product.not_for_sale || false);
        setBrandName(product.brand_name || '');
        setManufacturerName(product.manufacturer_name || '');
        setMrpPrice(product.mrp_price?.toString() || '');
        setWarrantyPeriod(product.warranty_period || '');
        setDiscountPercent(product.discount_percent?.toString() || '');
      }
    }
  }, [isEditMode, id, getProduct]);

  // Calculate GST
  const calculateGST = () => {
    const price = parseFloat(sellingPrice) || 0;
    const rate = parseFloat(taxRate) || 0;
    
    if (price === 0 || rate === 0) return { baseAmount: 0, gstAmount: 0, totalAmount: 0 };

    let baseAmount, gstAmount, totalAmount;
    
    if (taxInclusive) {
      totalAmount = price;
      baseAmount = price / (1 + rate / 100);
      gstAmount = totalAmount - baseAmount;
    } else {
      baseAmount = price;
      gstAmount = (price * rate) / 100;
      totalAmount = baseAmount + gstAmount;
    }

    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  };

  const taxCalculation = calculateGST();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      toast.error('Please enter a valid selling price');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: name.trim(),
        product_type: productType,
        selling_price: parseFloat(sellingPrice),
        cost_price: parseFloat(purchasePrice) || 0,
        quantity: parseFloat(stock) || 0,
        unit: unit || 'pcs',
        category: category || 'Others',
        hsn_code: hsnCode,
        barcode: barcode || `BAR-${Date.now()}`,
        sku: sku || `SKU-${Date.now()}`,
        min_stock_level: parseFloat(lowStockAlert) || 10,
        tax_rate: parseFloat(taxRate) || 0,
        image: image || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`,
        description: description,
        tax_inclusive: taxInclusive,
        gst_category: parseFloat(taxRate) === 0 ? 'exempt' as const : parseFloat(taxRate) <= 5 ? 'zero_rated' as const : parseFloat(taxRate) <= 18 ? 'standard' as const : 'luxury' as const,
        is_online: isOnline,
        not_for_sale: notForSale,
        brand_name: brandName,
        manufacturer_name: manufacturerName,
        mrp_price: parseFloat(mrpPrice) || undefined,
        warranty_period: warrantyPeriod,
        discount_percent: parseFloat(discountPercent) || undefined,
      };

      if (isEditMode && id) {
        await updateProduct(id, productData);
        toast.success('Product updated successfully!');
      } else {
        await addProduct(productData);
        toast.success('Product added successfully!');
      }

      navigate('/inventory');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = productType === 'Product' ? productCategories : serviceCategories;
  const units = productType === 'Product' ? productUnits : serviceDurations;

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? 'Update product details' : 'Add a new product or service to your inventory'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Essential product details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Type Toggle */}
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Tabs value={productType} onValueChange={(v) => setProductType(v as 'Product' | 'Service')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="Product">Product</TabsTrigger>
                        <TabsTrigger value="Service">Service</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {productType === 'Product' ? 'Product Name' : 'Service Name'} *
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={`Enter ${productType.toLowerCase()} name`}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter product description"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Tax</CardTitle>
                  <CardDescription>
                    Set prices and tax rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selling Price */}
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price *</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Purchase Price */}
                  {productType === 'Product' && (
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">Purchase Price</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {/* GST Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">GST Rate</Label>
                    <Select value={taxRate} onValueChange={setTaxRate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select GST rate" />
                      </SelectTrigger>
                      <SelectContent>
                        {gstRates.map((rate) => (
                          <SelectItem key={rate.value} value={rate.value.toString()}>
                            <div className="flex flex-col">
                              <span>{rate.label}</span>
                              <span className="text-xs text-muted-foreground">{rate.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tax Inclusive Switch */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Price includes GST</Label>
                      <p className="text-sm text-muted-foreground">
                        {taxInclusive ? 'Price is tax inclusive' : 'Price is tax exclusive'}
                      </p>
                    </div>
                    <Switch
                      checked={taxInclusive}
                      onCheckedChange={setTaxInclusive}
                    />
                  </div>

                  {/* Tax Calculation Preview */}
                  {sellingPrice && parseFloat(taxRate) > 0 && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <h4 className="text-sm font-semibold mb-2">Tax Calculation</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base Amount:</span>
                            <span>{formatCurrency(taxCalculation.baseAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">GST ({taxRate}%):</span>
                            <span>{formatCurrency(taxCalculation.gstAmount)}</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-1 border-t">
                            <span>Total Amount:</span>
                            <span>{formatCurrency(taxCalculation.totalAmount)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Stock Management (Products only) */}
              {productType === 'Product' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Management</CardTitle>
                    <CardDescription>
                      Manage inventory levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Initial Stock */}
                      <div className="space-y-2">
                        <Label htmlFor="stock">Initial Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          step="0.01"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      {/* Unit */}
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={unit} onValueChange={setUnit}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Low Stock Alert */}
                      <div className="space-y-2">
                        <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                        <Input
                          id="lowStockAlert"
                          type="number"
                          value={lowStockAlert}
                          onChange={(e) => setLowStockAlert(e.target.value)}
                          placeholder="10"
                        />
                      </div>

                      {/* SKU */}
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="Auto-generated"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Duration (Services only) */}
              {productType === 'Service' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                    <CardDescription>
                      Service duration and billing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit">Duration/Billing Type</Label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Product Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {image ? (
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show in online store</Label>
                      <p className="text-xs text-muted-foreground">
                        Display in your catalog
                      </p>
                    </div>
                    <Switch
                      checked={isOnline}
                      onCheckedChange={setIsOnline}
                    />
                  </div>

                  {productType === 'Product' && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Not for sale</Label>
                        <p className="text-xs text-muted-foreground">
                          For tracking only
                        </p>
                      </div>
                      <Switch
                        checked={notForSale}
                        onCheckedChange={setNotForSale}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? 'Update Product' : 'Add Product'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/inventory')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
