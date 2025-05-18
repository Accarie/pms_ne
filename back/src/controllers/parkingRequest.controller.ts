import { Request, Response } from "express";
import prisma from "../../prisma/prisma-client";
import { CreateParkingRequestDTO, UpdateParkingRequestDTO } from "../dtos/parkingRequest.dto";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { sendParkingSlotConfirmationEmail, sendRejectionEmail } from "../utils/mail";

const createParkingRequest = async (req: Request, res: Response) => {
    const dto = plainToInstance(CreateParkingRequestDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Check if vehicle belongs to user
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: dto.vehicleId },
        });
        if (!vehicle || vehicle.userId !== (req as any).user.id) {
            return res.status(403).json({ message: "the vehicle is not authorized" });
        }

        // Create parking request with status PENDING
        const parkingRequest = await prisma.parkingRequest.create({
            data: {
                userId: (req as any).user.id,
                vehicleId: dto.vehicleId,
                checkIn: new Date(dto.checkIn),
                checkOut: new Date(dto.checkOut),
                status: "PENDING",
            },
        });
       // when the parking request is created
        return res.status(201).json(parkingRequest);
    } catch (error) {
        // when an error occurs
        return res.status(500).json({ message: "An error occured while creating a parking request", error });
    }
};
// getting table of parking requests of a specific auntheticated user
const getUserParkingRequests = async (req: Request, res: Response) => {
    try {
        const requests = await prisma.parkingRequest.findMany({
            where: { userId: (req as any).user.id },
            include: { parkingSlot: true, vehicle: true },
        });
        return res.status(200).json(requests);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch parking requests", error });
    }
};
// getting all parking requests for the admin routes which also returns related vehicle, and user details
const getAllParkingRequests = async (req: Request, res: Response) => {
    try {
        const requests = await prisma.parkingRequest.findMany({
            include: { parkingSlot: true, vehicle: true, user: true },
        });
        return res.status(200).json(requests);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch parking requests", error });
    }
};
// approving Parking a request which is done by admin
const approveParkingRequest = async (req: Request, res: Response) => {
    const { id } = req.params;
    // checking if the request is available or not
    try {
        const request = await prisma.parkingRequest.findUnique({
            where: { id },
            include: { parkingSlot: true },
        });
        // returns an error if the request is not found
        if (!request) {
            return res.status(404).json({ message: "the request was not found" });
        }
        // returns an error also if the request was already processed(rejected or approved)
        if (request.status !== "PENDING") {
            return res.status(400).json({ message: "Request already processed" });
        }

        // Find an available parking slot
        const availableSlot = await prisma.parkingSlot.findFirst({
            where: { isAvailable: true },
        });
        // returns an error also the slots aren't available
        if (!availableSlot) {
            return res.status(400).json({ message: "No available parking slots" });
        }

        // Update request status and assign slot
        await prisma.parkingRequest.update({
            where: { id },
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                parkingSlotId: availableSlot.id,
            },
        });

        //send confirmation email to user
        const user = await prisma.user.findUnique({
            where: { id: request.userId },
        });
        if (user) {
            await sendParkingSlotConfirmationEmail(user.email,user.names, availableSlot.slotNumber);
        }
    

        // Mark slot as unavailable
        await prisma.parkingSlot.update({
            where: { id: availableSlot.id },
            data: { isAvailable: false },
        });

        return res.status(200).json({ message: "Request approved", slotNumber: availableSlot.slotNumber });
    } catch (error) {
        return res.status(500).json({ message: "An error occured while approving your request", error });
    }
};
// admin rejecting the request made by the user
const rejectParkingRequest = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const request = await prisma.parkingRequest.findUnique({
            where: { id },
        });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (request.status !== "PENDING") {
            return res.status(400).json({ message: "Request already processed" });
        }

        await prisma.parkingRequest.update({
            where: { id },
            data: {
                status: "REJECTED",
            },
        });

        //send rejection email to user
        const user = await prisma.user.findUnique({
            where: { id: request.userId },
        });
        if (user) {
            await sendRejectionEmail(user.email, user.names);
        }

        return res.status(200).json({ message: "your request was rejected" });
    } catch (error) {
        return res.status(500).json({ message: "An error occured when rejecting reques", error });
    }
};

const parkingRequestController = {
    createParkingRequest,
    getUserParkingRequests,
    getAllParkingRequests,
    approveParkingRequest,
    rejectParkingRequest,
};

export default parkingRequestController;
