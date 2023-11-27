// Import the necessary dependencies
const { of } = require('rxjs');
const { lastValueFrom } = require('rxjs');
const { timer } = require('rxjs');
const { switchMap } = require('rxjs/operators');
const { filter } = require('rxjs/operators');

// Mock the fetch functions
const fetchVehicles = jest.fn();
const fetchVehicleDetails = jest.fn();
const fetchEnergyHistory = jest.fn();
const fetchEnergyCurrent = jest.fn();
const fetchSettings = jest.fn();

// Mock the subjects
const vehiclesSubject = {
    next: jest.fn(),
    asObservable: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};
const vehicleDetailsSubject = {
    next: jest.fn(),
    asObservable: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};
const energyHistorySubject = {
    next: jest.fn(),
    asObservable: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};
const energyCurrentSubject = {
    next: jest.fn(),
    asObservable: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};
const settingsSubject = {
    next: jest.fn(),
    asObservable: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};

// Mock the fetch functions implementation
fetchVehicles.mockReturnValue(of('vehiclesData'));
fetchVehicleDetails.mockReturnValue(of('vehicleDetailsData'));
fetchEnergyHistory.mockReturnValue(of('energyHistoryData'));
fetchEnergyCurrent.mockReturnValue(of('energyCurrentData'));
fetchSettings.mockReturnValue(of('settingsData'));

// Mock the timer function
jest.useFakeTimers();

// Import the apiService object
import apiService from '../../../app/utils/ApiService.js'; // Replace 'your-file' with the actual filename

describe('apiService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchVehicles', () => {
        it('should call fetchVehicles and emit the data to vehiclesSubject', () => {
            apiService.fetchVehicles();
            expect(fetchVehicles).toHaveBeenCalled();
            expect(vehiclesSubject.next).toHaveBeenCalledWith('vehiclesData');
        });
    });

    describe('fetchVehicleDetails', () => {
        it('should call fetchVehicleDetails and emit the data to vehicleDetailsSubject', async () => {
            await apiService.fetchVehicleDetails();
            expect(fetchVehicleDetails).toHaveBeenCalled();
            expect(vehicleDetailsSubject.next).toHaveBeenCalledWith('vehicleDetailsData');
        });

        it('should handle errors in fetchVehicleDetails', async () => {
            fetchVehicleDetails.mockReturnValueOnce(Promise.reject('error'));
            await apiService.fetchVehicleDetails();
            expect(fetchVehicleDetails).toHaveBeenCalled();
            expect(vehicleDetailsSubject.next).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith('Error in triggerFetchVehicleDetails:', 'error');
        });
    });

    // Add tests for other functions in apiService

    describe('scheduleVehiclesRefresh', () => {
        it('should schedule vehicles refresh and emit the data to vehiclesSubject', () => {
            apiService.scheduleVehiclesRefresh(5000);
            expect(timer).toHaveBeenCalledWith(0, 5000);
            expect(fetchVehicles).toHaveBeenCalled();
            jest.advanceTimersByTime(5000);
            expect(vehiclesSubject.next).toHaveBeenCalledWith('vehiclesData');
        });
    });

    describe('scheduleVehicleDetailsRefresh', () => {
        it('should schedule vehicle details refresh and emit the data to vehicleDetailsSubject', () => {
            apiService.scheduleVehicleDetailsRefresh(5000);
            expect(timer).toHaveBeenCalledWith(0, 5000);
            expect(fetchVehicleDetails).toHaveBeenCalled();
            jest.advanceTimersByTime(5000);
            expect(vehicleDetailsSubject.next).toHaveBeenCalledWith('vehicleDetailsData');
        });
    });

    // Add tests for other schedule functions

    describe('observables', () => {
        it('should return the correct observables', () => {
            expect(apiService.vehicles$).toEqual({ subscribe: expect.any(Function) });
            expect(apiService.vehicleDetails$).toEqual({ subscribe: expect.any(Function) });
            expect(apiService.energyHistory$).toEqual({ subscribe: expect.any(Function) });
            expect(apiService.energyCurrent$).toEqual({ subscribe: expect.any(Function) });
            expect(apiService.settings$).toEqual({ subscribe: expect.any(Function) });
        });
    });
});