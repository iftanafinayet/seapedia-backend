import * as authService from "../services/auth.service.js";

const REFRESH_COOKIE = "refreshToken";
const isProduction = process.env.NODE_ENV === "production";

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth/refresh",
  });
}

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshTokenStr = req.cookies[REFRESH_COOKIE];
    if (!refreshTokenStr) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }
    const result = await authService.refreshToken(refreshTokenStr);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
        activeRole: result.activeRole,
      },
    });
  } catch (error) {
    clearRefreshCookie(res);
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

export async function logout(req, res, next) {
  try {
    const refreshTokenStr = req.cookies[REFRESH_COOKIE];
    await authService.logout(req.user.userId, refreshTokenStr);
    clearRefreshCookie(res);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getFinancialSummary(req, res, next) {
  try {
    const summary = await authService.getFinancialSummary(req.user.userId);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
}
