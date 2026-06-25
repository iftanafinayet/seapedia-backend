export function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export function successMessage(res, message, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
  });
}

export function paginated(res, { data, page, limit, total }) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
