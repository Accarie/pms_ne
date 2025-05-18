import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, IsEnum } from "class-validator";

const RWANDA_PLATE_REGEX = /^RA[A-Z] \d{3}[A-Z]$/;

export enum VehicleStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
}

export class CreateVehicleDTO {
    @IsString()
    @MinLength(6)
    @MaxLength(10)
    @Matches(RWANDA_PLATE_REGEX, {
        message: 'Plate number must match Rwanda format: e.g. "RAD 456D".',
    })
    @IsNotEmpty()
    plateNumber: string;

    @IsString()
    @IsNotEmpty()
    color: string;
}

export class UpdateVehicleDTO {
    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(10)
    @Matches(RWANDA_PLATE_REGEX, {
        message: 'Plate number must match Rwanda format: e.g. "RAD 456D".',
    })
    plateNumber?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsEnum(VehicleStatus)
    status?: VehicleStatus;
}
