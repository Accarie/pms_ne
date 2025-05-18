import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../../components/tables";
import {
  requestColumns,
  Requests,
} from "../../components/tables/columns";
import API_ENDPOINTS from "../../constants/api";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import Loader from "../../components/commons/loader";
import CreateEditRequest from "../../components/modals/request/createEditRequest";
import { approveRequest, deleteRequest, rejectRequest } from "../../services/requestService";

const RequestPage: React.FC = () => {
  const [requests, setRequests] = useState<Requests[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Requests | null>(null);
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : {};
  const UserRole = parsedUser.role?.toLowerCase();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      let response;

      if (UserRole === "admin") {
        response = await axios.get(API_ENDPOINTS.parkingRequests.all, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
      } else {
        response = await axios.get(API_ENDPOINTS.parkingRequests.mine, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
      }

      const { data } = response;
      setRequests(data);
    } catch (err) {
      console.error("Request fetch error:", err);
      setError("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };
  

  const handleEdit = (request: Requests) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleCreateRequest = () => {
    setSelectedRequest(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (request: Requests) => {
    try {
      await deleteRequest(request.id || "");
      toast.success("Request deleted successfully");
      fetchRequests();
    } catch {
      toast.error("Failed to delete request");
    }
  };

  const handleSuccess = () => {
    fetchRequests();
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id);
      fetchRequests();
    } catch (error) {
      console.error(error);
   
    }finally{
      fetchRequests();
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectRequest(id);
      fetchRequests();
    } catch (error) {
      console.error(error);
    }finally{
      fetchRequests();
    }
  };
  

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4">
      <div>
        <h1 className="text-2xl font-semibold mb-4">
          {
            UserRole === "admin"
              ? "All Requests"
              : UserRole === "user"
              ? "My Requests"
              : "Requests"
          }
        </h1>

        {/* User Create Request */}
        {UserRole === "user" && (
          <Button onClick={handleCreateRequest} className="mb-4 mr-2">
            Create Request
          </Button>
        )}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <Loader />
      ) : (
        <DataTable<Requests>
          data={requests}
          columns={requestColumns()}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
          role={UserRole}
          tableType="requests"
        />
      )}

      <CreateEditRequest
        isOpen={isDialogOpen}
        requestToEdit={
          selectedRequest
            ? selectedRequest.checkIn && selectedRequest.checkOut
              ? {
                  id: selectedRequest.id,
                  vehicleId: selectedRequest.vehicleId,
                  checkIn: selectedRequest.checkIn,
                  checkOut: selectedRequest.checkOut,
                }
              : null
            : null
        }
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default RequestPage;
