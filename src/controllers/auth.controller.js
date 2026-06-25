import * as authService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const profile = await authService.getProfile(req.user.userId);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function setActiveRole(req, res, next) {
  try {
    const result = await authService.setActiveRole(req.user.userId, req.body.activeRole);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
