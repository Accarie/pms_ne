import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import { getAllUsers } from "../../services/userService";
import { getAllSlots } from "../../services/slotService";
import { Slots, Users } from "../../components/tables/columns";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPage: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [slotCount, setSlotCount] = useState<number>(0);
  const [availableSlots, setAvailableSlots] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getAllUsers();
        const filteredUserData = userData.filter((user: Users) => user.role === "USER");
        setUserCount(filteredUserData.length);

        const slotData = await getAllSlots();
        setSlotCount(slotData.data.length);
        const available = slotData.data.filter((slot: Slots) => slot.isAvailable === true);
        setAvailableSlots(available.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const COLORS = ["#1E3A8A", "#3B82F6", "#D4DEE1"];

  const pieData = [
    { name: "Users", value: userCount },
    { name: "Slots", value: slotCount },
    { name: "Available Slots", value: availableSlots },
  ];

  const barData = [
    {
      name: "Analytics",
      Users: userCount,
      Slots: slotCount,
      Available: availableSlots,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-black">Dashboard Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="transition-transform transform hover:scale-105 shadow-md animate-pop-up">
          <CardHeader>
            <CardTitle>Number of Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-black">{userCount}</p>
          </CardContent>
        </Card>
        <Card className="transition-transform transform hover:scale-105 shadow-md animate-pop-up delay-100">
          <CardHeader>
            <CardTitle>Number of slots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-black">{slotCount}</p>
          </CardContent>
        </Card>
        <Card className="transition-transform transform hover:scale-105 shadow-md animate-pop-up delay-200">
          <CardHeader>
            <CardTitle>Available slots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-black">{availableSlots}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pie Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bar Graph</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Users" fill="#1E3A8A" />
                <Bar dataKey="Slots" fill="#3B82F6" />
                <Bar dataKey="Available" fill="#D4DEE1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;