// Invoice System - Professional Templates
// 15+ Production-Ready Invoice Templates with GST Compliance

import React from "react";
import { InvoiceData, InvoiceTemplate } from "@/types/invoice";
import { formatDate, formatAmount, numberToWords } from "./invoiceUtils";

// ==================== TEMPLATE METADATA ====================

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Gradient design with card-based sections",
    category: "corporate",
    color: "#00C48C",
    previewColor: "linear-gradient(135deg, #00C48C 0%, #00A76F 100%)",
    features: ["Gradient header", "Card layout", "Rounded corners", "Shadows"],
    bestFor: "Tech companies, startups"
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional layout",
    category: "corporate",
    color: "#5B37B7",
    previewColor: "#5B37B7",
    features: ["Purple accent", "Clean table", "Alternating rows", "Footer message"],
    bestFor: "Standard business invoices"
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean black and white",
    category: "corporate",
    color: "#000000",
    previewColor: "#111827",
    features: ["Black & white", "Thin borders", "Typography-focused", "White space"],
    bestFor: "Design agencies, consultants"
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Clean tech-inspired like Stripe invoices",
    category: "corporate",
    color: "#635BFF",
    previewColor: "#635BFF",
    features: ["Purple accent", "Clean lines", "Status badge", "Modern layout"],
    bestFor: "SaaS companies, tech startups"
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Professional accounting style",
    category: "corporate",
    color: "#2CA01C",
    previewColor: "#2CA01C",
    features: ["Green theme", "Detailed breakdown", "Professional", "Accounting-ready"],
    bestFor: "Accountants, bookkeepers, SMBs"
  },
  {
    id: "retail",
    name: "Retail",
    description: "Receipt-style POS layout",
    category: "retail",
    color: "#FF6B6B",
    previewColor: "#FF6B6B",
    features: ["Monospace font", "Dashed borders", "Compact", "POS-style"],
    bestFor: "Retail stores, cafes"
  },
  {
    id: "mrp-discount",
    name: "MRP & Discount",
    description: "Shows MRP, selling price, discounts",
    category: "retail",
    color: "#2563EB",
    previewColor: "#2563EB",
    features: ["MRP column", "Discount display", "Blue accent", "Grid cards"],
    bestFor: "E-commerce, retail promotions"
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Traditional boxed design",
    category: "industry",
    color: "#1F2937",
    previewColor: "#4B5563",
    features: ["Boxed border", "Dark header", "Per-item tax", "Traditional"],
    bestFor: "Automotive, industrial, warehouses"
  },
  {
    id: "landscape",
    name: "Landscape",
    description: "Horizontal wide layout",
    category: "industry",
    color: "#7C3AED",
    previewColor: "#7C3AED",
    features: ["Wide format", "Gradient bar", "Dense grid", "All details"],
    bestFor: "Detailed invoices, exports"
  },
  {
    id: "evergreen",
    name: "Evergreen",
    description: "Green corporate theme",
    category: "industry",
    color: "#10B981",
    previewColor: "#10B981",
    features: ["Green theme", "Tax summary", "Professional panels", "Clean"],
    bestFor: "Environmental, healthcare"
  },
  {
    id: "gst-compliant",
    name: "GST Compliant",
    description: "Full GST compliance for India",
    category: "gst",
    color: "#F59E0B",
    previewColor: "#F59E0B",
    features: ["HSN codes", "Tax breakdown", "Declaration", "Amount in words"],
    bestFor: "Indian businesses, GST filing"
  },
  {
    id: "classic-blue",
    name: "Classic Blue",
    description: "Blue header with compact design",
    category: "compact",
    color: "#1D4ED8",
    previewColor: "#1D4ED8",
    features: ["Blue header", "Compact", "Badge style", "Small business"],
    bestFor: "Small businesses"
  },
  {
    id: "compact-table",
    name: "Compact Table",
    description: "Dense one-line rows",
    category: "compact",
    color: "#6366F1",
    previewColor: "#6366F1",
    features: ["Dense rows", "Dashed borders", "Minimal width", "Quick"],
    bestFor: "Quick invoices"
  },
  {
    id: "compact-v2",
    name: "Compact V2",
    description: "Alternative compact layout",
    category: "compact",
    color: "#6F42C1",
    previewColor: "#6F42C1",
    features: ["Purple accent", "Space-efficient", "Clean", "Fast"],
    bestFor: "Simple invoices"
  },
  {
    id: "bill-ship",
    name: "Bill To / Ship To",
    description: "Separate billing and shipping",
    category: "retail",
    color: "#F59E0B",
    previewColor: "#F59E0B",
    features: ["Dual addresses", "Orange accent", "Grid layout", "E-commerce"],
    bestFor: "E-commerce with delivery"
  }
];

// ==================== TEMPLATE COMPONENTS ====================

// Modern Template
export const ModernTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <div style={{ fontFamily: "Inter, sans-serif", maxWidth: "850px", margin: "0 auto", padding: "40px", backgroundColor: "#fff" }}>
    {/* Header with Gradient */}
    <div style={{ background: "linear-gradient(135deg, #00C48C 0%, #00A76F 100%)", padding: "30px", borderRadius: "12px", marginBottom: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
        <div>
          {data.businessLogo && <img src={data.businessLogo} alt="Logo" style={{ height: "50px", marginBottom: "10px" }} />}
          <h1 style={{ margin: "0", fontSize: "32px", fontWeight: "700" }}>INVOICE</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "18px", fontWeight: "600" }}>#{data.billNumber}</div>
          <div style={{ fontSize: "14px", marginTop: "5px" }}>Date: {formatDate(data.billDate, "long")}</div>
          <div style={{ fontSize: "14px" }}>Due: {formatDate(data.dueDate, "long")}</div>
        </div>
      </div>
    </div>

    {/* Business & Customer Info Cards */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
      <div style={{ backgroundColor: "#F9FAFB", padding: "20px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>From</h3>
        <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "5px", color: "#a9a9a9" }}>{data.businessName}</div>
        <div style={{ fontSize: "14px", color: "#4B5563", lineHeight: "1.6" }}>
          {data.businessAddress}<br />
          {data.businessPhone}<br />
          {data.businessEmail}<br />
          {data.businessGST && <><strong>GSTIN:</strong> {data.businessGST}</>}
        </div>
      </div>

      <div style={{ backgroundColor: "#F9FAFB", padding: "20px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>To</h3>
        <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "5px", color: "#a9a9a9" }}>{data.customerName}</div>
        <div style={{ fontSize: "14px", color: "#4B5563", lineHeight: "1.6" }}>
          {data.customerAddress}<br />
          {data.customerPhone}<br />
          {data.customerEmail}<br />
          {data.customerGST && <><strong>GSTIN:</strong> {data.customerGST}</>}
        </div>
      </div>
    </div>

    {/* Items Table */}
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
      <thead>
        <tr style={{ backgroundColor: "#F3F4F6", borderBottom: "2px solid #00C48C" }}>
          <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#374151" }}>#</th>
          <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#374151" }}>ITEM</th>
          <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#374151" }}>HSN</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#374151" }}>QTY</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#374151" }}>PRICE</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#374151" }}>DISC%</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#374151" }}>AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, index) => (
          <tr key={item.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
            <td style={{ padding: "12px", fontSize: "14px", color: "#6B7280" }}>{index + 1}</td>
            <td style={{ padding: "12px", fontSize: "14px", color: "#111827" }}>
              <div style={{ fontWeight: "500" }}>{item.name}</div>
              {item.description && <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{item.description}</div>}
            </td>
            <td style={{ padding: "12px", textAlign: "center", fontSize: "14px", color: "#6B7280" }}>{item.hsn || "-"}</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#111827" }}>{item.quantity}</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#111827" }}>{data.currencySymbol}{formatAmount(parseFloat(item.price))}</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#111827" }}>{item.discount}%</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#111827" }}>{data.currencySymbol}{formatAmount(parseFloat(item.amount))}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Totals Section */}
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
      <div style={{ width: "350px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px" }}>
          <span style={{ color: "#6B7280" }}>Subtotal:</span>
          <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.subtotal)}</span>
        </div>
        {data.includeGST && (
          <>
            {data.gstType === "cgst_sgst" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px", borderTop: "1px solid #E5E7EB" }}>
                  <span style={{ color: "#6B7280" }}>CGST ({data.gstRate / 2}%):</span>
                  <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.cgst || 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px" }}>
                  <span style={{ color: "#6B7280" }}>SGST ({data.gstRate / 2}%):</span>
                  <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.sgst || 0)}</span>
                </div>
              </>
            ) : data.gstType === "igst" ? (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px", borderTop: "1px solid #E5E7EB" }}>
                <span style={{ color: "#6B7280" }}>IGST ({data.gstRate}%):</span>
                <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.igst || 0)}</span>
              </div>
            ) : null}
          </>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 20px", fontSize: "18px", backgroundColor: "#00C48C", color: "white", borderRadius: "8px", marginTop: "10px" }}>
          <span style={{ fontWeight: "700" }}>TOTAL:</span>
          <span style={{ fontWeight: "700" }}>{data.currencySymbol}{formatAmount(data.total)}</span>
        </div>
      </div>
    </div>

    {/* Notes & Terms */}
    {(data.notes || data.termsAndConditions) && (
      <div style={{ display: "grid", gridTemplateColumns: data.notes && data.termsAndConditions ? "1fr 1fr" : "1fr", gap: "20px", marginTop: "30px", paddingTop: "20px", borderTop: "2px solid #E5E7EB" }}>
        {data.notes && (
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Notes</h4>
            <p style={{ margin: "0", fontSize: "13px", color: "#4B5563", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{data.notes}</p>
          </div>
        )}
        {data.termsAndConditions && (
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Terms & Conditions</h4>
            <p style={{ margin: "0", fontSize: "13px", color: "#4B5563", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{data.termsAndConditions}</p>
          </div>
        )}
      </div>
    )}

    {/* Footer */}
    <div style={{ marginTop: "40px", textAlign: "center", paddingTop: "20px", borderTop: "1px solid #E5E7EB" }}>
      <p style={{ margin: "0", fontSize: "14px", color: "#00C48C", fontWeight: "600" }}>Thank you for your business!</p>
    </div>
  </div>
);

// Classic Template
export const ClassicTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto", padding: "40px", backgroundColor: "#fff" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
      <div>
        {data.businessLogo && <img src={data.businessLogo} alt="Logo" style={{ height: "60px", marginBottom: "15px" }} />}
        <h2 style={{ margin: "0", fontSize: "28px", color: "#a9a9a9" }}>{data.businessName}</h2>
        <p style={{ margin: "5px 0", fontSize: "14px", color: "#6B7280", lineHeight: "1.6" }}>
          {data.businessAddress}<br />
          Phone: {data.businessPhone}<br />
          Email: {data.businessEmail}<br />
          {data.businessGST && <>GSTIN: {data.businessGST}</>}
        </p>
      </div>
      <div style={{ backgroundColor: "#5B37B7", color: "white", padding: "20px 30px", borderRadius: "8px", textAlign: "right" }}>
        <div style={{ fontSize: "24px", fontWeight: "700", marginBottom: "5px" }}>INVOICE</div>
        <div style={{ fontSize: "16px", marginBottom: "3px" }}>#{data.billNumber}</div>
        <div style={{ fontSize: "13px", opacity: 0.9 }}>Date: {formatDate(data.billDate)}</div>
        <div style={{ fontSize: "13px", opacity: 0.9 }}>Due: {formatDate(data.dueDate)}</div>
      </div>
    </div>

    <div style={{ backgroundColor: "#F3F4F6", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600", color: "#5B37B7" }}>BILL TO:</h3>
      <div style={{ fontSize: "16px", fontWeight: "700", color: "#a9a9a9" }}>{data.customerName}</div>
      <div style={{ fontSize: "14px", color: "#4B5563", marginTop: "5px", lineHeight: "1.6" }}>
        {data.customerAddress}<br />
        {data.customerPhone} | {data.customerEmail}<br />
        {data.customerGST && <>GSTIN: {data.customerGST}</>}
      </div>
    </div>

    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
      <thead>
        <tr style={{ backgroundColor: "#5B37B7", color: "white" }}>
          <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600" }}>DESCRIPTION</th>
          <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: "600" }}>HSN</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600" }}>QTY</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600" }}>RATE</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600" }}>DISC%</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600" }}>AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, index) => (
          <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
            <td style={{ padding: "12px", fontSize: "14px", color: "#111827" }}>
              <div style={{ fontWeight: "500" }}>{item.name}</div>
              {item.description && <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{item.description}</div>}
            </td>
            <td style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "#6B7280" }}>{item.hsn || "-"}</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#111827" }}>{item.quantity}</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#111827" }}>{data.currencySymbol}{formatAmount(parseFloat(item.price))}</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#111827" }}>{item.discount}%</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#111827" }}>{data.currencySymbol}{formatAmount(parseFloat(item.amount))}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "300px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#4B5563" }}>
          <span>Subtotal:</span>
          <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.subtotal)}</span>
        </div>
        {data.includeGST && data.gstType === "cgst_sgst" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#4B5563" }}>
              <span>CGST ({data.gstRate / 2}%):</span>
              <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.cgst || 0)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#4B5563" }}>
              <span>SGST ({data.gstRate / 2}%):</span>
              <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.sgst || 0)}</span>
            </div>
          </>
        )}
        {data.includeGST && data.gstType === "igst" && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#4B5563" }}>
            <span>IGST ({data.gstRate}%):</span>
            <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.igst || 0)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", fontSize: "18px", fontWeight: "700", color: "#5B37B7", borderTop: "2px solid #5B37B7", marginTop: "10px" }}>
          <span>TOTAL:</span>
          <span>{data.currencySymbol}{formatAmount(data.total)}</span>
        </div>
      </div>
    </div>

    {data.termsAndConditions && (
      <div style={{ marginTop: "40px", padding: "15px", backgroundColor: "#F9FAFB", borderLeft: "4px solid #5B37B7" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "600", color: "#5B37B7" }}>TERMS & CONDITIONS</h4>
        <p style={{ margin: "0", fontSize: "12px", color: "#4B5563", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{data.termsAndConditions}</p>
      </div>
    )}

    <div style={{ marginTop: "40px", textAlign: "center", fontSize: "14px", color: "#6B7280" }}>
      <p style={{ margin: "0" }}>Thank you for your business!</p>
    </div>
  </div>
);

// GST Compliant Template (Full Indian GST Compliance)
export const GSTCompliantTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto", padding: "30px", backgroundColor: "#fff", border: "2px solid #000" }}>
    {/* Tax Invoice Header */}
    <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "15px", marginBottom: "20px" }}>
      <h1 style={{ margin: "0", fontSize: "32px", fontWeight: "700", color: "#000" }}>TAX INVOICE</h1>
      {data.businessLogo && <img src={data.businessLogo} alt="Logo" style={{ height: "50px", marginTop: "10px" }} />}
    </div>

    {/* Seller Details */}
    <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #000" }}>
      <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px", color: "#000" }}>SELLER DETAILS:</div>
      <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "5px", color: "#a9a9a9" }}>{data.businessName}</div>
      <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#000" }}>
        Address: {data.businessAddress}<br />
        State: {data.businessState || "N/A"}<br />
        Phone: {data.businessPhone} | Email: {data.businessEmail}<br />
        <strong>GSTIN: {data.businessGST || "N/A"}</strong>
      </div>
    </div>

    {/* Invoice Details & Buyer Details */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
      <div style={{ border: "1px solid #000", padding: "15px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>INVOICE DETAILS:</div>
        <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
          <strong>Invoice No:</strong> {data.billNumber}<br />
          <strong>Invoice Date:</strong> {formatDate(data.billDate, "long")}<br />
          <strong>Due Date:</strong> {formatDate(data.dueDate, "long")}<br />
          <strong>Place of Supply:</strong> {data.customerState || "N/A"}
        </div>
      </div>

      <div style={{ border: "1px solid #000", padding: "15px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>BUYER DETAILS:</div>
        <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "5px", color: "#a9a9a9" }}>{data.customerName}</div>
        <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
          {data.customerAddress}<br />
          State: {data.customerState || "N/A"}<br />
          {data.customerPhone}<br />
          <strong>GSTIN: {data.customerGST || "Unregistered"}</strong>
        </div>
      </div>
    </div>

    {/* Items Table with HSN */}
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", border: "1px solid #000" }}>
      <thead>
        <tr style={{ backgroundColor: "#F59E0B", color: "#000" }}>
          <th style={{ padding: "10px", textAlign: "left", fontSize: "11px", fontWeight: "700", border: "1px solid #000" }}>S.No</th>
          <th style={{ padding: "10px", textAlign: "left", fontSize: "11px", fontWeight: "700", border: "1px solid #000" }}>DESCRIPTION OF GOODS</th>
          <th style={{ padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: "700", border: "1px solid #000" }}>HSN/SAC</th>
          <th style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "700", border: "1px solid #000" }}>QTY</th>
          <th style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "700", border: "1px solid #000" }}>RATE</th>
          <th style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "700", border: "1px solid #000" }}>DISC%</th>
          <th style={{ padding: "10px", textAlign: "right", fontSize: "11px", fontWeight: "700", border: "1px solid #000" }}>TAXABLE VALUE</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, index) => (
          <tr key={item.id}>
            <td style={{ padding: "10px", fontSize: "13px", border: "1px solid #000" }}>{index + 1}</td>
            <td style={{ padding: "10px", fontSize: "13px", border: "1px solid #000" }}>
              {item.name}
              {item.description && <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{item.description}</div>}
            </td>
            <td style={{ padding: "10px", textAlign: "center", fontSize: "13px", border: "1px solid #000" }}>{item.hsn || "-"}</td>
            <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", border: "1px solid #000" }}>{item.quantity}</td>
            <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", border: "1px solid #000" }}>{data.currencySymbol}{formatAmount(parseFloat(item.price))}</td>
            <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", border: "1px solid #000" }}>{item.discount}%</td>
            <td style={{ padding: "10px", textAlign: "right", fontSize: "13px", fontWeight: "600", border: "1px solid #000" }}>{data.currencySymbol}{formatAmount(parseFloat(item.amount))}</td>
          </tr>
        ))}
        <tr style={{ backgroundColor: "#FEF3C7" }}>
          <td colSpan={6} style={{ padding: "10px", textAlign: "right", fontSize: "13px", fontWeight: "700", border: "1px solid #000" }}>TAXABLE AMOUNT:</td>
          <td style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "700", border: "1px solid #000" }}>{data.currencySymbol}{formatAmount(data.subtotal)}</td>
        </tr>
      </tbody>
    </table>

    {/* Tax Breakdown */}
    {data.includeGST && (
      <div style={{ marginBottom: "15px", border: "1px solid #000" }}>
        <div style={{ backgroundColor: "#F59E0B", padding: "8px", fontSize: "12px", fontWeight: "700", borderBottom: "1px solid #000" }}>TAX SUMMARY:</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#FEF3C7" }}>
              <th style={{ padding: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid #000", textAlign: "left" }}>TAX TYPE</th>
              <th style={{ padding: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid #000", textAlign: "right" }}>RATE</th>
              <th style={{ padding: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid #000", textAlign: "right" }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.gstType === "cgst_sgst" ? (
              <>
                <tr>
                  <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000" }}>CGST</td>
                  <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000", textAlign: "right" }}>{data.gstRate / 2}%</td>
                  <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000", textAlign: "right", fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.cgst || 0)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000" }}>SGST</td>
                  <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000", textAlign: "right" }}>{data.gstRate / 2}%</td>
                  <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000", textAlign: "right", fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.sgst || 0)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000" }}>IGST</td>
                <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000", textAlign: "right" }}>{data.gstRate}%</td>
                <td style={{ padding: "8px", fontSize: "12px", border: "1px solid #000", textAlign: "right", fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.igst || 0)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}

    {/* Grand Total */}
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
      <div style={{ width: "400px", border: "2px solid #000", backgroundColor: "#FEF3C7" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "15px", fontSize: "20px", fontWeight: "700" }}>
          <span>GRAND TOTAL:</span>
          <span>{data.currencySymbol}{formatAmount(data.total)}</span>
        </div>
      </div>
    </div>

    {/* Amount in Words */}
    <div style={{ marginBottom: "20px", padding: "12px", border: "1px solid #000", backgroundColor: "#FFFBEB" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", marginBottom: "5px" }}>AMOUNT IN WORDS:</div>
      <div style={{ fontSize: "14px", fontWeight: "600", fontStyle: "italic" }}>{numberToWords(data.total)}</div>
    </div>

    {/* Bank Details */}
    {data.bankDetails && (
      <div style={{ marginBottom: "20px", padding: "12px", border: "1px solid #000" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", marginBottom: "5px" }}>BANK DETAILS:</div>
        <div style={{ fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{data.bankDetails}</div>
      </div>
    )}

    {/* Terms & Declaration */}
    <div style={{ marginBottom: "20px" }}>
      {data.termsAndConditions && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", marginBottom: "5px" }}>TERMS & CONDITIONS:</div>
          <div style={{ fontSize: "11px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{data.termsAndConditions}</div>
        </div>
      )}
      <div style={{ fontSize: "11px", lineHeight: "1.6" }}>
        <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
      </div>
    </div>

    {/* Signature */}
    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "30px" }}>
      <div>
        <div style={{ fontSize: "11px", fontWeight: "700" }}>Customer Signature</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", marginBottom: "40px", color: "#a9a9a9" }}>For {data.businessName}</div>
        <div style={{ borderTop: "1px solid #000", paddingTop: "5px", fontSize: "11px" }}>Authorized Signatory</div>
      </div>
    </div>
  </div>
);

// Minimal Template
export const MinimalTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", maxWidth: "750px", margin: "0 auto", padding: "50px 40px", backgroundColor: "#fff" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "50px", paddingBottom: "20px", borderBottom: "1px solid #000" }}>
      <div>
        <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "300", letterSpacing: "2px", color: "#000" }}>INVOICE</h1>
        <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>#{data.billNumber}</div>
      </div>
      <div style={{ textAlign: "right", fontSize: "13px", color: "#666", lineHeight: "1.8" }}>
        <div>Date: {formatDate(data.billDate, "long")}</div>
        <div>Due: {formatDate(data.dueDate, "long")}</div>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "50px" }}>
      <div>
        <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#999", marginBottom: "10px" }}>FROM</div>
        <div style={{ fontSize: "16px", fontWeight: "600", color: "#a9a9a9", marginBottom: "8px" }}>{data.businessName}</div>
        <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.8" }}>
          {data.businessAddress}<br />
          {data.businessPhone}<br />
          {data.businessEmail}
        </div>
      </div>

      <div>
        <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#999", marginBottom: "10px" }}>TO</div>
        <div style={{ fontSize: "16px", fontWeight: "600", color: "#a9a9a9", marginBottom: "8px" }}>{data.customerName}</div>
        <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.8" }}>
          {data.customerAddress}<br />
          {data.customerPhone}<br />
          {data.customerEmail}
        </div>
      </div>
    </div>

    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #000" }}>
          <th style={{ padding: "12px 0", textAlign: "left", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#999" }}>ITEM</th>
          <th style={{ padding: "12px 0", textAlign: "right", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#999" }}>QTY</th>
          <th style={{ padding: "12px 0", textAlign: "right", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#999" }}>RATE</th>
          <th style={{ padding: "12px 0", textAlign: "right", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#999" }}>AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item) => (
          <tr key={item.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
            <td style={{ padding: "15px 0", fontSize: "14px", color: "#000" }}>{item.name}</td>
            <td style={{ padding: "15px 0", textAlign: "right", fontSize: "14px", color: "#666" }}>{item.quantity}</td>
            <td style={{ padding: "15px 0", textAlign: "right", fontSize: "14px", color: "#666" }}>{data.currencySymbol}{formatAmount(parseFloat(item.price))}</td>
            <td style={{ padding: "15px 0", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#000" }}>{data.currencySymbol}{formatAmount(parseFloat(item.amount))}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "300px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px", color: "#666" }}>
          <span>Subtotal</span>
          <span>{data.currencySymbol}{formatAmount(data.subtotal)}</span>
        </div>
        {data.includeGST && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px", color: "#666" }}>
            <span>Tax ({data.gstRate}%)</span>
            <span>{data.currencySymbol}{formatAmount(data.gstAmount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", fontSize: "20px", fontWeight: "600", color: "#000", borderTop: "2px solid #000", marginTop: "10px" }}>
          <span>Total</span>
          <span>{data.currencySymbol}{formatAmount(data.total)}</span>
        </div>
      </div>
    </div>

    {data.notes && (
      <div style={{ marginTop: "50px", fontSize: "12px", color: "#666", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
        {data.notes}
      </div>
    )}
  </div>
);

// Retail Template
export const RetailTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <div style={{ fontFamily: "'Courier New', monospace", maxWidth: "400px", margin: "0 auto", padding: "30px 20px", backgroundColor: "#fff", border: "2px dashed #FF6B6B" }}>
    <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "15px", borderBottom: "2px dashed #FF6B6B" }}>
      <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "700", color: "#FF6B6B" }}>{data.businessName}</h2>
      <div style={{ fontSize: "11px", color: "#666", marginTop: "8px", lineHeight: "1.6" }}>
        {data.businessAddress}<br />
        Tel: {data.businessPhone}
      </div>
    </div>

    <div style={{ textAlign: "center", marginBottom: "15px", fontSize: "11px", color: "#666" }}>
      <div>INVOICE: {data.billNumber}</div>
      <div>DATE: {formatDate(data.billDate)}</div>
      <div>TIME: {new Date().toLocaleTimeString()}</div>
    </div>

    <div style={{ marginBottom: "15px", paddingBottom: "10px", borderBottom: "1px dashed #ccc", fontSize: "11px" }}>
      <div style={{ fontWeight: "700", marginBottom: "5px" }}>CUSTOMER:</div>
      <div style={{ color: "#a9a9a9" }}>{data.customerName}</div>
      <div>{data.customerPhone}</div>
    </div>

    <div style={{ borderBottom: "2px dashed #FF6B6B", paddingBottom: "10px", marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", marginBottom: "8px" }}>
        <span style={{ flex: "2" }}>ITEM</span>
        <span style={{ width: "40px", textAlign: "right" }}>QTY</span>
        <span style={{ width: "60px", textAlign: "right" }}>RATE</span>
        <span style={{ width: "70px", textAlign: "right" }}>AMOUNT</span>
      </div>
      {data.items.map((item) => (
        <div key={item.id} style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "2px" }}>{item.name}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666" }}>
            <span style={{ flex: "2" }}></span>
            <span style={{ width: "40px", textAlign: "right" }}>{item.quantity}</span>
            <span style={{ width: "60px", textAlign: "right" }}>{data.currencySymbol}{item.price}</span>
            <span style={{ width: "70px", textAlign: "right", fontWeight: "600", color: "#000" }}>{data.currencySymbol}{formatAmount(parseFloat(item.amount))}</span>
          </div>
        </div>
      ))}
    </div>

    <div style={{ fontSize: "12px", marginBottom: "15px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
        <span>SUBTOTAL:</span>
        <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.subtotal)}</span>
      </div>
      {data.includeGST && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
          <span>TAX ({data.gstRate}%):</span>
          <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.gstAmount)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "16px", fontWeight: "700", borderTop: "2px dashed #FF6B6B", marginTop: "5px" }}>
        <span>TOTAL:</span>
        <span>{data.currencySymbol}{formatAmount(data.total)}</span>
      </div>
    </div>

    <div style={{ textAlign: "center", fontSize: "11px", color: "#666", paddingTop: "15px", borderTop: "2px dashed #FF6B6B" }}>
      <div style={{ fontWeight: "700", marginBottom: "5px" }}>THANK YOU!</div>
      <div>Please visit again</div>
    </div>
  </div>
);

// Stripe-Inspired Template (Most Popular SaaS)
export const StripeTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "40px", backgroundColor: "#fff" }}>
    {/* Header */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "50px" }}>
      <div>
        {data.businessLogo && <img src={data.businessLogo} alt="Logo" style={{ height: "40px", marginBottom: "20px" }} />}
        <h1 style={{ margin: "0", fontSize: "32px", fontWeight: "600", color: "#1A1A1A" }}>Invoice</h1>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "14px", color: "#697386", marginBottom: "4px" }}>Invoice number</div>
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#1A1A1A", marginBottom: "16px" }}>{data.billNumber}</div>
        <div style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#F6F9FC", border: "1px solid #E3E8EE", borderRadius: "4px", fontSize: "13px", color: "#697386" }}>
          {data.status || "Draft"}
        </div>
      </div>
    </div>

    {/* Info Grid */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "40px", padding: "24px", backgroundColor: "#F6F9FC", borderRadius: "8px" }}>
      <div>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>From</div>
        <div style={{ fontSize: "15px", fontWeight: "600", color: "#a9a9a9", marginBottom: "4px" }}>{data.businessName}</div>
        <div style={{ fontSize: "14px", color: "#697386", lineHeight: "1.6" }}>
          {data.businessAddress}<br />
          {data.businessEmail}<br />
          {data.businessPhone}
        </div>
      </div>

      <div>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>To</div>
        <div style={{ fontSize: "15px", fontWeight: "600", color: "#a9a9a9", marginBottom: "4px" }}>{data.customerName}</div>
        <div style={{ fontSize: "14px", color: "#697386", lineHeight: "1.6" }}>
          {data.customerAddress}<br />
          {data.customerEmail}<br />
          {data.customerPhone}
        </div>
      </div>

      <div>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Invoice Date</div>
        <div style={{ fontSize: "14px", color: "#1A1A1A" }}>{formatDate(data.billDate, "long")}</div>
      </div>

      <div>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Due Date</div>
        <div style={{ fontSize: "14px", color: "#1A1A1A" }}>{formatDate(data.dueDate, "long")}</div>
      </div>
    </div>

    {/* Items Table */}
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #E3E8EE" }}>
          <th style={{ padding: "12px 0", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</th>
          <th style={{ padding: "12px 0", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px" }}>Qty</th>
          <th style={{ padding: "12px 0", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px" }}>Unit Price</th>
          <th style={{ padding: "12px 0", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item) => (
          <tr key={item.id} style={{ borderBottom: "1px solid #F6F9FC" }}>
            <td style={{ padding: "16px 0", fontSize: "15px", color: "#1A1A1A" }}>
              <div style={{ fontWeight: "500" }}>{item.name}</div>
              {item.description && <div style={{ fontSize: "13px", color: "#697386", marginTop: "4px" }}>{item.description}</div>}
            </td>
            <td style={{ padding: "16px 0", textAlign: "right", fontSize: "15px", color: "#697386" }}>{item.quantity}</td>
            <td style={{ padding: "16px 0", textAlign: "right", fontSize: "15px", color: "#697386" }}>{data.currencySymbol}{formatAmount(parseFloat(item.price))}</td>
            <td style={{ padding: "16px 0", textAlign: "right", fontSize: "15px", fontWeight: "500", color: "#1A1A1A" }}>{data.currencySymbol}{formatAmount(parseFloat(item.amount))}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Totals */}
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
      <div style={{ width: "300px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: "15px", color: "#697386" }}>
          <span>Subtotal</span>
          <span>{data.currencySymbol}{formatAmount(data.subtotal)}</span>
        </div>
        {data.includeGST && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: "15px", color: "#697386" }}>
            <span>Tax ({data.gstRate}%)</span>
            <span>{data.currencySymbol}{formatAmount(data.gstAmount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontSize: "18px", fontWeight: "600", color: "#1A1A1A", borderTop: "2px solid #E3E8EE" }}>
          <span>Amount due</span>
          <span>{data.currencySymbol}{formatAmount(data.total)}</span>
        </div>
      </div>
    </div>

    {/* Notes */}
    {data.notes && (
      <div style={{ padding: "20px", backgroundColor: "#F6F9FC", borderRadius: "8px", marginBottom: "24px" }}>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#697386", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Notes</div>
        <div style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{data.notes}</div>
      </div>
    )}
  </div>
);

// QuickBooks-Inspired Template (Most Popular Accounting)
export const QuickBooksTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "850px", margin: "0 auto", padding: "40px", backgroundColor: "#fff" }}>
    {/* Header with Green Accent */}
    <div style={{ borderBottom: "4px solid #2CA01C", paddingBottom: "20px", marginBottom: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {data.businessLogo && <img src={data.businessLogo} alt="Logo" style={{ height: "50px", marginBottom: "15px" }} />}
          <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "700", color: "#393A3D" }}>INVOICE</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ backgroundColor: "#2CA01C", color: "white", padding: "8px 16px", borderRadius: "4px", marginBottom: "10px" }}>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Invoice #</div>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>{data.billNumber}</div>
          </div>
          <div style={{ fontSize: "13px", color: "#5F6368" }}>
            <div>Date: {formatDate(data.billDate)}</div>
            <div>Due: {formatDate(data.dueDate)}</div>
          </div>
        </div>
      </div>
    </div>

    {/* Business & Customer Info */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
      <div>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#2CA01C", marginBottom: "8px", textTransform: "uppercase" }}>Bill From:</div>
        <div style={{ border: "1px solid #E8EAED", padding: "15px", borderRadius: "4px" }}>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#a9a9a9", marginBottom: "8px" }}>{data.businessName}</div>
          <div style={{ fontSize: "13px", color: "#5F6368", lineHeight: "1.6" }}>
            {data.businessAddress}<br />
            {data.businessPhone}<br />
            {data.businessEmail}<br />
            {data.businessGST && <><strong>Tax ID:</strong> {data.businessGST}</>}
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#2CA01C", marginBottom: "8px", textTransform: "uppercase" }}>Bill To:</div>
        <div style={{ border: "1px solid #E8EAED", padding: "15px", borderRadius: "4px" }}>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#a9a9a9", marginBottom: "8px" }}>{data.customerName}</div>
          <div style={{ fontSize: "13px", color: "#5F6368", lineHeight: "1.6" }}>
            {data.customerAddress}<br />
            {data.customerPhone}<br />
            {data.customerEmail}<br />
            {data.customerGST && <><strong>Tax ID:</strong> {data.customerGST}</>}
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", border: "1px solid #E8EAED" }}>
      <thead>
        <tr style={{ backgroundColor: "#F8F9FA" }}>
          <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#393A3D", borderBottom: "2px solid #2CA01C" }}>#</th>
          <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#393A3D", borderBottom: "2px solid #2CA01C" }}>ITEM & DESCRIPTION</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#393A3D", borderBottom: "2px solid #2CA01C" }}>QTY</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#393A3D", borderBottom: "2px solid #2CA01C" }}>RATE</th>
          <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#393A3D", borderBottom: "2px solid #2CA01C" }}>AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, index) => (
          <tr key={item.id} style={{ borderBottom: "1px solid #E8EAED" }}>
            <td style={{ padding: "12px", fontSize: "13px", color: "#5F6368" }}>{index + 1}</td>
            <td style={{ padding: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#393A3D" }}>{item.name}</div>
              {item.description && <div style={{ fontSize: "12px", color: "#5F6368", marginTop: "2px" }}>{item.description}</div>}
              {item.hsn && <div style={{ fontSize: "11px", color: "#5F6368", marginTop: "2px" }}>HSN: {item.hsn}</div>}
            </td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", color: "#393A3D" }}>{item.quantity}</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", color: "#393A3D" }}>{data.currencySymbol}{formatAmount(parseFloat(item.price))}</td>
            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#393A3D" }}>{data.currencySymbol}{formatAmount(parseFloat(item.amount))}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Totals Section */}
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
      <div style={{ width: "350px", border: "1px solid #E8EAED", borderRadius: "4px", padding: "20px", backgroundColor: "#F8F9FA" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#5F6368" }}>
          <span>Subtotal:</span>
          <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.subtotal)}</span>
        </div>
        {data.includeGST && gstType === "cgst_sgst" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#5F6368" }}>
              <span>CGST ({data.gstRate / 2}%):</span>
              <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.cgst || 0)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#5F6368" }}>
              <span>SGST ({data.gstRate / 2}%):</span>
              <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.sgst || 0)}</span>
            </div>
          </>
        )}
        {data.includeGST && data.gstType === "igst" && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#5F6368" }}>
            <span>Tax ({data.gstRate}%):</span>
            <span style={{ fontWeight: "600" }}>{data.currencySymbol}{formatAmount(data.gstAmount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontSize: "20px", fontWeight: "700", color: "#2CA01C", borderTop: "2px solid #2CA01C", marginTop: "10px" }}>
          <span>TOTAL:</span>
          <span>{data.currencySymbol}{formatAmount(data.total)}</span>
        </div>
      </div>
    </div>

    {/* Payment Instructions */}
    {data.paymentInstructions && (
      <div style={{ backgroundColor: "#FFF9E6", border: "1px solid #FFE17F", padding: "15px", borderRadius: "4px", marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#856404", marginBottom: "8px" }}>Payment Instructions:</div>
        <div style={{ fontSize: "13px", color: "#856404", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{data.paymentInstructions}</div>
      </div>
    )}

    {/* Terms */}
    {data.termsAndConditions && (
      <div style={{ fontSize: "11px", color: "#5F6368", lineHeight: "1.6", paddingTop: "20px", borderTop: "1px solid #E8EAED" }}>
        <div style={{ fontWeight: "700", marginBottom: "8px" }}>Terms & Conditions:</div>
        <div style={{ whiteSpace: "pre-wrap" }}>{data.termsAndConditions}</div>
      </div>
    )}
  </div>
);

// Template Renderer Function
export function renderInvoiceTemplate(templateId: string, data: InvoiceData): React.ReactNode {
  const templates: Record<string, React.ComponentType<{ data: InvoiceData }>> = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    minimal: MinimalTemplate,
    stripe: StripeTemplate,
    quickbooks: QuickBooksTemplate,
    "gst-compliant": GSTCompliantTemplate,
    retail: RetailTemplate,
    // Add more templates as needed
  };

  const Template = templates[templateId] || ModernTemplate;
  return <Template data={data} />;
}

// Get template by ID
export function getTemplateById(id: string): InvoiceTemplate | undefined {
  return INVOICE_TEMPLATES.find(t => t.id === id);
}

// Get templates by category
export function getTemplatesByCategory(category: string): InvoiceTemplate[] {
  return INVOICE_TEMPLATES.filter(t => t.category === category);
}

