/**
 * Staff Detail Page
 * Complete staff profile with attendance tracking, calendar, and payslip generation
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  IndianRupee,
  Edit,
  Trash2,
  Download,
  FileText,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { staffService } from "@/lib/staffService";
import { Staff, AttendanceRecord, AttendanceStatus, DateFilterOption, ATTENDANCE_COLORS } from "@/types/staff";
import { AddStaffModal } from "@/components/AddStaffModal";
import { buildPayslipData, generatePayslipHTML, printPayslip, generatePayslipFilename } from "@/lib/payslipGenerator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useStaff } from "@/hooks/useUserData";
import { userDataService } from "@/services/api/userDataService";
import { supabase } from "@/integrations/supabase/client";

export default function StaffDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businessProfile } = useBusinessContext();
  const { getSymbol, format: formatCurrencyWithContext } = useCurrency();
  
  // Fetch staff from Supabase
  const { data: supabaseStaff, isLoading: isLoadingStaff } = useStaff();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<DateFilterOption>("current");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipHTML, setPayslipHTML] = useState("");

  // Find staff member from Supabase data
  useEffect(() => {
    if (id && supabaseStaff && supabaseStaff.length > 0) {
      const foundStaff = supabaseStaff.find(s => s.id === id);
      
      if (foundStaff) {
        // Transform Supabase staff to local format
        const transformedStaff: Staff = {
          id: foundStaff.id,
          name: foundStaff.name,
          phone: foundStaff.phone,
          email: foundStaff.email || undefined,
          position: foundStaff.position,
          monthlySalary: Number(foundStaff.monthly_salary),
          hireDate: foundStaff.hire_date,
          address: foundStaff.address || undefined,
          emergencyContact: foundStaff.emergency_contact || undefined,
          notes: foundStaff.notes || undefined,
          isActive: foundStaff.is_active ?? true,
          basicPercent: foundStaff.basic_percent ? Number(foundStaff.basic_percent) : undefined,
          hraPercent: foundStaff.hra_percent ? Number(foundStaff.hra_percent) : undefined,
          allowancesAmount: foundStaff.allowances_amount ? Number(foundStaff.allowances_amount) : undefined,
          includePF: foundStaff.include_pf ?? false,
          pfPercent: foundStaff.pf_percent ? Number(foundStaff.pf_percent) : undefined,
          includeESI: foundStaff.include_esi ?? false,
          esiPercent: foundStaff.esi_percent ? Number(foundStaff.esi_percent) : undefined,
          allowedLeaveDays: foundStaff.allowed_leave_days ?? undefined,
          createdAt: new Date(foundStaff.created_at).toISOString(),
          updatedAt: new Date(foundStaff.updated_at).toISOString(),
        };
        
        setStaff(transformedStaff);
        setLoading(false);
      } else {
        toast.error("Staff member not found");
        navigate("/staff");
      }
    }
  }, [id, supabaseStaff, navigate]);

  useEffect(() => {
    if (id) {
      loadStaffData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadAttendanceData();
    }
  }, [id, selectedFilter, selectedMonth]);

  const loadStaffData = async () => {
    // Staff data now loaded from useStaff hook above
    // This function kept for attendance loading
  };

  const loadAttendanceData = async () => {
    if (!id) return;

    try {
      const { startDate, endDate } = getDisplayPeriod();
      
      // Fetch attendance from Supabase
      const result = await userDataService.fetchAttendanceRecords(id, startDate, endDate);
      
      if (result.error) {
        console.error('Attendance fetch error:', result.error);
        toast.error('Failed to load attendance data');
        return;
      }

      // Transform Supabase attendance to local format
      const transformedRecords: AttendanceRecord[] = (result.data || []).map(record => ({
        id: record.id,
        staffId: record.staff_id,
        date: record.date,
        status: record.status as AttendanceStatus,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      }));

      setAttendanceRecords(transformedRecords);
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast.error("Failed to load attendance data");
    }
  };

  const getDisplayPeriod = () => {
    const now = selectedMonth;
    const year = now.getFullYear();
    const month = now.getMonth();

    let startDate: Date, endDate: Date;

    if (selectedFilter === "current") {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else if (selectedFilter === "last1") {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else if (selectedFilter === "last2") {
      startDate = new Date(year, month - 2, 1);
      endDate = new Date(year, month, 0);
    } else if (selectedFilter === "last3") {
      startDate = new Date(year, month - 3, 1);
      endDate = new Date(year, month, 0);
    } else if (selectedFilter === "last6") {
      startDate = new Date(year, month - 6, 1);
      endDate = new Date(year, month, 0);
    } else if (selectedFilter === "year") {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    } else {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    }

    return { startDate, endDate };
  };

  // Calculate attendance summary
  const attendanceSummary = useMemo(() => {
    if (!staff) return null;
    return staffService.calculateAttendanceSummary(
      attendanceRecords,
      staff.allowedLeaveDays || 2
    );
  }, [attendanceRecords, staff]);

  // Calculate salary breakdown
  const salaryBreakdown = useMemo(() => {
    if (!staff || !attendanceSummary) return null;
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    return staffService.calculateSalary(staff, attendanceSummary, year, month);
  }, [staff, attendanceSummary, selectedMonth]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const record = attendanceRecords.find((r) => r.date === dateStr);
      days.push({
        day,
        date: dateStr,
        status: record?.status || null,
        isToday: dateStr === new Date().toISOString().split("T")[0],
      });
    }

    return days;
  }, [selectedMonth, attendanceRecords]);

  const handleMarkAttendance = async (date: string, currentStatus: AttendanceStatus | null) => {
    if (!id) return;

    // Cycle through statuses: null -> present -> half -> leave -> absent -> null
    const statusCycle: (AttendanceStatus | null)[] = [null, "present", "half", "leave", "absent"];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    try {
      if (nextStatus === null) {
        // Delete attendance record from Supabase
        const attendanceId = `${id}_${date}`;
        await (supabase as any)
          .from('attendance_records')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', attendanceId);
        toast.success("Attendance unmarked");
      } else {
        // Mark attendance in Supabase
        const result = await userDataService.markAttendance(id, date, nextStatus);
        if (result.error) {
          throw new Error(result.error);
        }
        toast.success(`Marked as ${nextStatus}`);
      }
      loadAttendanceData();
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance");
    }
  };

  const handleQuickMarkToday = async (status: AttendanceStatus) => {
    if (!id) return;

    const todayDate = new Date().toISOString().split("T")[0];
    try {
      const result = await userDataService.markAttendance(id, todayDate, status);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success(`Today marked as ${status}`);
      loadAttendanceData();
    } catch (error) {
      console.error("Error marking today:", error);
      toast.error("Failed to mark attendance");
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const success = await staffService.deleteStaff(id);
      if (success) {
        toast.success("Staff member deleted successfully");
        navigate("/staff");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff member");
    }
  };

  const handleGeneratePayslip = () => {
    if (!staff || !salaryBreakdown || !attendanceSummary) {
      toast.error("Unable to generate payslip");
      return;
    }

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const currencySymbol = getSymbol();

    const payslipData = buildPayslipData(
      staff,
      salaryBreakdown,
      attendanceSummary,
      year,
      month,
      businessProfile,
      currencySymbol
    );

    const html = generatePayslipHTML(payslipData, currencySymbol);
    setPayslipHTML(html);
    setIsPayslipModalOpen(true);
  };

  const handlePrintPayslip = () => {
    if (payslipHTML) {
      printPayslip(payslipHTML);
      toast.success("Opening print dialog...");
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  const getStatusColor = (status: AttendanceStatus | null) => {
    if (!status) return ATTENDANCE_COLORS.unmarked;
    return ATTENDANCE_COLORS[status];
  };

  const getStatusLabel = (status: AttendanceStatus | null) => {
    if (!status) return "Unmarked";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading staff data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!staff) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Staff Not Found</h2>
            <p className="text-muted-foreground mb-4">The staff member you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/staff")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff List
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/staff")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{staff.name}</h1>
              <p className="text-sm text-muted-foreground">{staff.position}</p>
            </div>
            <Badge variant={staff.isActive ? "default" : "secondary"} className={staff.isActive ? "bg-green-500" : ""}>
              {staff.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="text-red-600" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Staff Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{staff.phone}</div>
              </div>
            </div>
            {staff.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{staff.email}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Date of Joining</div>
                <div className="font-medium">{formatDate(staff.hireDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IndianRupee className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Monthly Salary</div>
                <div className="font-medium">{formatCurrency(staff.monthlySalary)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Position</div>
                <div className="font-medium">{staff.position}</div>
              </div>
            </div>
            {staff.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium">{staff.address}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Period Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold">
              {selectedMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
              disabled={selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear()}
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
          <Select value={selectedFilter} onValueChange={(v: DateFilterOption) => setSelectedFilter(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">This Month</SelectItem>
              <SelectItem value="last1">Last Month</SelectItem>
              <SelectItem value="last2">Last 2 Months</SelectItem>
              <SelectItem value="last3">Last 3 Months</SelectItem>
              <SelectItem value="last6">Last 6 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Button onClick={() => handleQuickMarkToday("present")} className="bg-green-600 hover:bg-green-700">
            <UserCheck className="h-4 w-4 mr-2" />
            Mark Present
          </Button>
          <Button onClick={() => handleQuickMarkToday("half")} className="bg-orange-600 hover:bg-orange-700">
            <Clock className="h-4 w-4 mr-2" />
            Mark Half Day
          </Button>
          <Button onClick={() => handleQuickMarkToday("leave")} className="bg-indigo-600 hover:bg-indigo-700">
            <Calendar className="h-4 w-4 mr-2" />
            Mark Leave
          </Button>
          <Button onClick={() => handleQuickMarkToday("absent")} variant="outline" className="text-red-600">
            Absent
          </Button>
          <Button onClick={handleGeneratePayslip} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Payslip
          </Button>
        </div>

        {/* Stats Cards */}
        {attendanceSummary && salaryBreakdown && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{attendanceSummary.present}</div>
                <div className="text-sm text-muted-foreground">Present Days</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{attendanceSummary.half}</div>
                <div className="text-sm text-muted-foreground">Half Days</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-indigo-600">{attendanceSummary.leave}</div>
                <div className="text-sm text-muted-foreground">Leave Days</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{attendanceSummary.absent}</div>
                <div className="text-sm text-muted-foreground">Absent Days</div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-foreground">{attendanceSummary.attendancePercentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Attendance Rate</div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(salaryBreakdown.netSalary)}</div>
                <div className="text-sm text-muted-foreground">Net Pay (Take Home)</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Calendar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>Click on any date to mark/update attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div key={index}>
                  {day ? (
                    <Button
                      variant="outline"
                      className={`w-full h-14 relative ${
                        day.isToday ? "border-2 border-primary" : ""
                      }`}
                      style={{ backgroundColor: getStatusColor(day.status) + "20" }}
                      onClick={() => handleMarkAttendance(day.date, day.status)}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{day.day}</span>
                        {day.status && (
                          <span className="text-xs">
                            {day.status === "present" ? "P" : day.status === "half" ? "H" : day.status === "leave" ? "L" : "A"}
                          </span>
                        )}
                      </div>
                    </Button>
                  ) : (
                    <div className="w-full h-14" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: ATTENDANCE_COLORS.present }} />
                <span className="text-sm">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: ATTENDANCE_COLORS.half }} />
                <span className="text-sm">Half Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: ATTENDANCE_COLORS.leave }} />
                <span className="text-sm">Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: ATTENDANCE_COLORS.absent }} />
                <span className="text-sm">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: ATTENDANCE_COLORS.unmarked }} />
                <span className="text-sm">Unmarked</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Breakdown */}
        {salaryBreakdown && attendanceSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown</CardTitle>
              <CardDescription>
                For {selectedMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">Earnings</h3>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Basic Salary ({salaryBreakdown.basicPercent}%)</span>
                      <span className="font-medium">{formatCurrency(salaryBreakdown.basicAmount)}</span>
                    </div>
                    {salaryBreakdown.hraAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">HRA ({salaryBreakdown.hraPercent}%)</span>
                        <span className="font-medium">{formatCurrency(salaryBreakdown.hraAmount)}</span>
                      </div>
                    )}
                    {salaryBreakdown.allowancesAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Other Allowances</span>
                        <span className="font-medium">{formatCurrency(salaryBreakdown.allowancesAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Gross Earnings</span>
                      <span className="text-green-600">{formatCurrency(salaryBreakdown.grossEarnings)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Deductions</h3>
                  <div className="space-y-2 pl-4">
                    {salaryBreakdown.attendanceDeduction > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Attendance Deduction</span>
                        <span className="font-medium">{formatCurrency(salaryBreakdown.attendanceDeduction)}</span>
                      </div>
                    )}
                    {salaryBreakdown.pfAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Provident Fund ({salaryBreakdown.pfPercent}%)</span>
                        <span className="font-medium">{formatCurrency(salaryBreakdown.pfAmount)}</span>
                      </div>
                    )}
                    {salaryBreakdown.esiAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">ESI ({salaryBreakdown.esiPercent}%)</span>
                        <span className="font-medium">{formatCurrency(salaryBreakdown.esiAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total Deductions</span>
                      <span className="text-red-600">{formatCurrency(salaryBreakdown.totalDeductions)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Net Pay (Take Home)</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(salaryBreakdown.netSalary)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Based on {attendanceSummary.daysCompleted} days of attendance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <AddStaffModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onStaffAdded={(updated) => {
            setStaff(updated);
            setIsEditModalOpen(false);
          }}
          editStaff={staff}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {staff.name}? This action cannot be undone and will also delete all
              attendance records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Modal */}
      <Dialog open={isPayslipModalOpen} onOpenChange={setIsPayslipModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
            <DialogDescription>
              {selectedMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })} - {staff.name}
            </DialogDescription>
          </DialogHeader>
          <div
            className="border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: payslipHTML }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayslipModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrintPayslip}>
              <Download className="h-4 w-4 mr-2" />
              Print / Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

