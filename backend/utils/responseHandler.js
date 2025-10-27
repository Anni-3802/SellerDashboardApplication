export const success = (res, data) => res.status(200).json(data);
export const notFound = (res, message = "Not Found") => res.status(404).json({ status: 404, message });
export const error = (res, message = "Internal Server Error") => res.status(500).json({ status: 500, message });
