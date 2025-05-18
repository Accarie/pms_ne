import DataTable from "../../components/tables";
import { getAllUsers } from "../../services/userService";
import { useEffect, useState } from "react";
import { userColumns, Users } from "../../components/tables/columns";
export default function UserPage() {
  const [users, setUsers] = useState<Users[]>([]);
  useEffect(() => {
    const getAll = async () => {
      const response = await getAllUsers();
      console.log("response gottttt---->>", response);
      setUsers(response);
    };
    getAll();
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <DataTable<Users> data={users} columns={userColumns()} />
    </div>
  );
}
