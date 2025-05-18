const cron = require("node-cron");
import prisma from "../../prisma/prisma-client";

export const startParkingSlotAvailabilityJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
// checks for parkingSlot whose Checkout time is now or has passed
      const expiredRequests = await prisma.parkingRequest.findMany({
        where: {
          checkOut: {
            lte: now,
          },
          status: "APPROVED",
          parkingSlotId: {
            not: null,
          },
        },
      });
// update the parking slot to available
      for (const request of expiredRequests) {
        if (request.parkingSlotId) {
          // Update parking slot to available
          await prisma.parkingSlot.update({
            where: { id: request.parkingSlotId },
            data: { isAvailable: true },
          });
        }
      }
    // sends an error if an error occurs
    } catch (error) {
      console.error("An error occurred while executing the parking slot availability task.:", error);
    }
  });
};
