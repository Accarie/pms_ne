import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../../components/tables";
import {
  slotColumns,
  Slots,
} from "../../components/tables/columns";
import API_ENDPOINTS from "../../constants/api";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import Loader from "../../components/commons/loader";
import { deleteSlot } from "../../services/slotService";
import CreateEditSlot from "../../components/modals/slot/createEditSlot";

const  SlotsPage: React.FC = () => {
  const [slots, setSlots] = useState<Slots[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slots | null>(null);
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : {};
  const UserRole = parsedUser.role?.toLowerCase();

  const fetchSlots = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_ENDPOINTS.parkingSlots.all, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const { data } = response.data;
      console.log("Fetched slots:", data);
      setSlots(data);
    } catch (err) {
      console.error("Vehicle fetch error:", err);
      setError("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slot: Slots) => {
    setSelectedSlot(slot);
    setIsDialogOpen(true);
  };

  const handleCreateSlot = () => {
    setSelectedSlot(null);
    setIsDialogOpen(true);
  };


  const handleDelete = async (slot: Slots) => {
    try {
      await deleteSlot(slot.id || "");
      toast.success("Slot deleted successfully");
      fetchSlots();
    } catch {
      toast.error("Failed to delete slot");
    }
  };

  const handleSuccess = () => {
    fetchSlots();
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  return (
    <div className="p-4">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Slots</h1>

        {/* User Create Vehicle */}
        {UserRole === "admin" && (
          <Button onClick={handleCreateSlot} className="mb-4 mr-2">
            Create Slot
          </Button>
        )}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <Loader />
      ) : (
        <DataTable<Slots>
          data={slots}
          columns={slotColumns()}
          onEdit={handleEdit}
          onDelete={handleDelete}
          role={UserRole}
          tableType="slots"
        />
      )}

      <CreateEditSlot
        isOpen={isDialogOpen}
        slotToEdit={selectedSlot}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default SlotsPage;
