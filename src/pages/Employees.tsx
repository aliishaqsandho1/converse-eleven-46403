import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck,
  Clock,
  DollarSign,
  Award,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmployeeFormModal, { type Employee } from "@/components/EmployeeFormModal";
import { employeesApi } from "@/services/api";

// Employee interface is now imported from the modal component

export default function Employees() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Removed newEmployee state - now handled by the modal

  const departments = ["Sales", "Operations", "Finance", "Customer Service", "IT", "HR", "Marketing", "Administration"];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesApi.getAll();
      if (data.success) {
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleSubmitEmployee = async (employeeData: Employee) => {
    try {
      setSubmitting(true);
      
      if (editingEmployee) {
        // Update existing employee
        const data = await employeesApi.update(editingEmployee.id!, employeeData);
        if (data.success) {
          setEmployees(prev => prev.map(emp => 
            emp.id === editingEmployee.id ? { ...employeeData, id: editingEmployee.id } : emp
          ));
          toast({
            title: "Success",
            description: `${employeeData.name} has been updated successfully`,
          });
          setEditingEmployee(null);
        }
      } else {
        // Create new employee
        const data = await employeesApi.create(employeeData);
        if (data.success) {
          setEmployees(prev => [...prev, data.data]);
          toast({
            title: "Success",
            description: `${employeeData.name} has been added to the team`,
          });
        }
      }
    } catch (error) {
      console.error('Error submitting employee:', error);
      toast({
        title: "Error",
        description: editingEmployee ? "Failed to update employee" : "Failed to add employee",
        variant: "destructive",
      });
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    const employee = employees.find(e => e.id === id);
    if (!employee || !confirm(`Are you sure you want to remove ${employee.name}?`)) return;

    try {
      const data = await employeesApi.delete(id);
      if (data.success) {
        setEmployees(employees.filter(e => e.id !== id));
        toast({
          title: "Employee Removed",
          description: `${employee.name} has been removed from the team`,
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormModalOpen(true);
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">On Leave</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Stats
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgSalary = totalSalary / employees.length;
  const departmentCounts = departments.map(dept => ({
    name: dept,
    count: employees.filter(e => e.department === dept).length
  }));

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-3 items-center text-lg text-muted-foreground">
            <RefreshCw className="animate-spin h-6 w-6" />
            Loading employees...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 bg-background min-h-[calc(100vh-65px)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
            <p className="text-muted-foreground">Manage your team and workforce</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEmployees} className="bg-card shadow-sm hover:bg-accent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateEmployee} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Salary</p>
                <p className="text-2xl font-bold text-blue-600">Rs. {Math.round(avgSalary).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Members
            </CardTitle>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <Badge variant="outline">{employee.department}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(employee.status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Salary</span>
                      <span className="font-semibold">Rs. {employee.salary.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate">{employee.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{employee.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Joined {new Date(employee.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Form Modal */}
      <EmployeeFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        employee={editingEmployee}
        onSubmit={handleSubmitEmployee}
        mode={editingEmployee ? 'edit' : 'create'}
      />
    </div>
  );
}