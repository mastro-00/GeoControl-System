import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as measurementController from "@controllers/measurementController";
import { Measurement } from "@models/dto/Measurement";
import { Measurements } from "@models/dto/Measurements";
import { Stats } from "@models/dto/Stats";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { closeTestDataSource, initializeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

jest.mock("@services/authService");
jest.mock("@controllers/measurementController");

const token = "Bearer faketoken";
const networkCode = "NET-001";
const gatewayMac = "94:3F:BE:4C:4A:79";
const sensorMac = "84:3F:BD:4C:3A:79";

  beforeAll(async () => {
    await initializeTestDataSource();
    const networkRepo = TestDataSource.getRepository(NetworkDAO)
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO)
    const sensorRepo = TestDataSource.getRepository(SensorDAO)
    const measurementRepo = TestDataSource.getRepository(MeasurementDAO)
    
    const network = networkRepo.create({
      code : "NET-001",
      name : "Test Network"
    })
    
    await networkRepo.save(network);

    const gateway = gatewayRepo.create({
      macAddress:"94:3F:BE:4C:4A:79",
      name : "Test Gateway",
      network : network  
    })

    await gatewayRepo.save(gateway);

    const sensor = sensorRepo.create({
      macAddress : "84:3F:BD:4C:3A:79",
      name : "Test Sensor",
      gateway : gateway
    })
  
    await sensorRepo.save(sensor);
    
    const measurement = measurementRepo.create({
      sensor : sensor,
      createdAt : new Date(),
      value : 42,
      isOutlier : false
    })
 
    await measurementRepo.save(measurement);


  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });


afterEach(() => jest.clearAllMocks());

describe("get all measurements of a specific network - MeasurementsRoutes integration", () => {
  it("200: returns all measurements", async () => {

      const data: Measurements[] = [{ 
          sensorMacAddress: sensorMac, 
          measurements: [],
          stats: {
              startDate: new Date(),
              endDate: new Date(),
              mean: 0,
              variance: 0,
              upperThreshold: 0,
              lowerThreshold: 0
          }
      }];
      
      (authService.processToken as jest.Mock).mockResolvedValue(token);
      (measurementController.getAllMeasurementsByNetwork as jest.Mock).mockResolvedValue(data);

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/measurements`)
        .set("Authorization", token);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(data);
  });

  it("400: Invalid Input Data", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/measurements`)
        .query({ startDate: "invalid-date" }) 
        .set("Authorization", token);

      expect(res.status).toBe(400);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/measurements`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("404: Network NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getAllMeasurementsByNetwork as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/measurements`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});

describe("get all statistics of a specific network - MeasurementsRoutes integration", () => {
  it("200: returns all statistics", async () => {
      const statsData: Stats = { 
          startDate: new Date(),
          endDate: new Date(),
          mean: 6,
          variance: 5,
          upperThreshold: 10,
          lowerThreshold: 1,
      };
      
      const mockResponse: Measurements[] = [{
          sensorMacAddress: sensorMac,
          stats: statsData,
          measurements: [] 
      }];

      (authService.processToken as jest.Mock).mockResolvedValue(token); 
      (measurementController.getStatsByNetwork as jest.Mock).mockResolvedValue(mockResponse);

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/stats`)
        .set("Authorization", token);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResponse);
  });

  it("400: Invalid Input Data", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/stats`)
        .query({ startDate: "invalid-date" }) 
        .set("Authorization", token);

      expect(res.status).toBe(400);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/stats`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("404: Network NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getStatsByNetwork as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/stats`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});

describe("get only outlier measurements of a specific network - MeasurementsRoutes integration", () => {
  it("200: returns all outlier measurements", async () => {
      const networkCode = "valid-network";
      const sensorMac = "00:11:22:33:44:55";
      const token = "Bearer valid.token.here";
      
      const data: Measurements = { 
          sensorMacAddress: sensorMac,
          stats: {
              startDate: new Date(),
              endDate: new Date(),
              mean: 0,
              variance: 0,
              upperThreshold: 0,
              lowerThreshold: 0
          },
          measurements: [] 
      };

      (authService.processToken as jest.Mock).mockResolvedValue({ userId: "test-user" });
          (measurementController.getOutliersByNetwork as jest.Mock).mockResolvedValue([data]);

      const res = await request(app)
          .get(`/api/v1/networks/${networkCode}/outliers`)
          .set("Authorization", token);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([data]);
  });

  it("400: Invalid Input Data", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/!invalid!/outliers`)
      .query({ startDate: "invalid-date" }) 
      .set("Authorization", token);

    expect(res.status).toBe(400);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/outliers`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("404: Network NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getOutliersByNetwork as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/outliers`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});

describe("create measurements for a sensor - MeasurementsRoutes integration", () => {
  const measurement: Measurement = {
    createdAt: new Date(),
    value: 42,
    isOutlier:false
  };

  it("201: measurement created", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(token);
    (measurementController.createMeasurement as jest.Mock).mockResolvedValue(measurement);

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .send([measurement]) 
      .set("Authorization", token);

    expect(res.status).toBe(201);
    
  });


  it("400: Invalid Input Data", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .send({})
      .set("Authorization", token);

    expect(res.status).toBe(400);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .send(measurement)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("403: InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .send([measurement]) 
      .set("Authorization", token);

    expect(res.status).toBe(403);
  });

  it("404: Network/Gateway/Sensor NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(token);
    (measurementController.createMeasurement as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Sensor not found");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .send([measurement]) 
      .set("Authorization", token);

    expect(res.status).toBe(404);

  });
});

describe("get all measurements of a specific sensor - MeasurementsRoutes integration", () => {
  it("200: returns measurements", async () => {
    const data: Measurements = { sensorMacAddress:sensorMac, measurements: [] };    
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getAllMeasurementsBySensor as jest.Mock).mockResolvedValue(data);

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
  });

  it("400: Invalid Input Data", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/!invalid!/measurements`)
      .query({ startDate: "invalid-date" }) 
      .set("Authorization", token);

    expect(res.status).toBe(400);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("404: Network/Gateway/Sensor NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getAllMeasurementsBySensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});

describe("get all statistics of a specific sensor - MeasurementsRoutes integration", () => {
  it("200: returns statistics", async () => {
    const data: Stats = { 
        startDate:new Date(),
        endDate:new Date(),
        mean:6,
        variance: 5,
        upperThreshold: 10,
        lowerThreshold: 1,
        };    
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getStatsBySensor as jest.Mock).mockResolvedValue(data);

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
  });

  it("400: Invalid Input Data", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/!invalid!/stats`)
      .query({ startDate: "invalid-date" }) 
      .set("Authorization", token);

    expect(res.status).toBe(400);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("404: Network NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getStatsBySensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});

describe("get outlier measurements of a specific sensor - MeasurementsRoutes integration", () => {
  it("200: returns outlier measurements", async () => {
 const data: Measurements = { sensorMacAddress:sensorMac, measurements: [] };    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getOutliersBySensor as jest.Mock).mockResolvedValue(data);

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
  });

  it("400: Invalid Input Data", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/!invalid!/outliers`)
      .query({ startDate: "invalid-date" }) 
      .set("Authorization", token);

    expect(res.status).toBe(400);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });
 
  it("404: Network NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getOutliersBySensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });
    
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  })
   
});


