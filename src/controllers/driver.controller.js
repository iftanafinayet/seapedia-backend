import * as deliveryService from "../services/delivery.service.js";

export async function getAvailableJobs(req, res, next) {
  try {
    const jobs = await deliveryService.getAvailableJobs();
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}

export async function getJobDetail(req, res, next) {
  try {
    const job = await deliveryService.getJobDetail(parseInt(req.params.id));
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
}

export async function takeJob(req, res, next) {
  try {
    const result = await deliveryService.takeJob({
      driverId: req.user.userId,
      jobId: parseInt(req.params.id),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function completeJob(req, res, next) {
  try {
    const result = await deliveryService.completeJob({
      driverId: req.user.userId,
      jobId: parseInt(req.params.id),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getEarnings(req, res, next) {
  try {
    const earnings = await deliveryService.getDriverEarnings(req.user.userId);
    res.json({ success: true, data: earnings });
  } catch (error) {
    next(error);
  }
}

export async function getMyJobs(req, res, next) {
  try {
    const jobs = await deliveryService.getMyJobs(req.user.userId);
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}
