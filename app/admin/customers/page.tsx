"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, Trash2, Mail } from "lucide-react";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse {
  customers: Customer[];
  pagination: PaginationData;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCustomers = async (page: number, search: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data: ApiResponse = await response.json();
      setCustomers(data.customers);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1, "");
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchCustomers(1, query);
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      toast.success("Customer deleted successfully");
      fetchCustomers(currentPage, searchQuery);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete customer");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">
            Manage and view all customer accounts
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search customers by name or email..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {customer.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.orderCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(customer.lastOrderDate)}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
              {pagination.total} customers
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fetchCustomers(currentPage - 1, searchQuery)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum =
                  currentPage <= 3
                    ? i + 1
                    : currentPage >= pagination.pages - 2
                      ? pagination.pages - 4 + i
                      : currentPage - 2 + i;

                if (pageNum < 1 || pageNum > pagination.pages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => fetchCustomers(pageNum, searchQuery)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                onClick={() => fetchCustomers(currentPage + 1, searchQuery)}
                disabled={currentPage === pagination.pages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
