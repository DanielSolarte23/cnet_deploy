import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Calendar,
  Package,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";

const NotificationsView = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const personalId = 8; // Valor estático como solicitaste
  const baseURL = "http://172.16.110.74:3004/api/notificaciones";

  // Función para obtener notificaciones
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/personal/${personalId}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener contador de no leídas
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${baseURL}/personal/${personalId}/count`);
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${baseURL}/${notificationId}/marcar-leida`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, leida: true, fechaLectura: new Date().toISOString() }
            : notif
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      await fetch(`${baseURL}/personal/${personalId}/marcar-todas-leidas`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          leida: true,
          fechaLectura: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`${baseURL}/${notificationId}`, {
        method: "DELETE",
      });

      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  //  Configurar conexión SSE para notificaciones en tiempo real
  useEffect(() => {
    const eventSource = new EventSource(
      `${baseURL}/sse?personalId=${personalId}`
      // { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        if (newNotification.personalId === personalId) {
          setNotifications((prev) => [newNotification, ...prev]);
          fetchUnreadCount();
        }
      } catch (err) {
        console.error("Error parseando SSE:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close(); // previene que se quede reconectando infinitamente
    };

    return () => {
      eventSource.close();
    };
  }, [personalId]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.leida;
    if (filter === "read") return notif.leida;
    return true;
  });

  // Obtener icono según tipo y nivel
  const getNotificationIcon = (tipo, nivel) => {
    if (tipo === "confirmacion")
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (nivel === "error") return <XCircle className="w-5 h-5 text-red-500" />;
    if (nivel === "warning")
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // if (!isOpen) return null;

  // if (loading) {
  //   return (
  //     <div className=" bg-slate-950 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  const handleOpenModalDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    if (!notification.leida) {
      markAsRead(notification.id);
    }
  };

  return (
    <>
      {/* Modal principal de notificaciones */}
      <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Botón marcar todas como leídas */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-lg font-medium transition-colors text-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar todas leídas</span>
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === "all"
                  ? "bg-yellow-500 text-slate-950"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === "unread"
                  ? "bg-yellow-500 text-slate-950"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              No leídas ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === "read"
                  ? "bg-yellow-500 text-slate-950"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              Leídas ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="max-h-80 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">
                {filter === "all"
                  ? "No hay notificaciones"
                  : `No hay notificaciones ${
                      filter === "unread" ? "sin leer" : "leídas"
                    }`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    !notification.leida
                      ? "bg-yellow-50 dark:bg-slate-800/50 border-l-2 border-yellow-500"
                      : ""
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        {getNotificationIcon(
                          notification.tipo,
                          notification.nivel
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                            {notification.mensaje}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(notification.fechaGeneracion)}
                          </p>
                        </div>
                      </div>
                      {!notification.leida && (
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>

                    {notification.detalles && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        {notification.detalles.proyecto && (
                          <p className="truncate">
                            <strong>Proyecto:</strong>{" "}
                            {notification.detalles.proyecto}
                          </p>
                        )}
                        {notification.detalles.entregaId && (
                          <p>
                            <strong>ID:</strong>{" "}
                            {notification.detalles.entregaId}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => handleOpenModalDetails(notification)}
                        className="text-xs text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 font-medium"
                      >
                        Ver detalles
                      </button>

                      <div className="flex space-x-1">
                        {!notification.leida && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-400 rounded transition-colors"
                            title="Marcar como leída"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">
                  Detalles de Notificación
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <strong className="text-yellow-500">Mensaje:</strong>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">
                    {selectedNotification.mensaje}
                  </p>
                </div>

                {selectedNotification.detalles && (
                  <div>
                    <strong className="text-yellow-500">Detalles:</strong>
                    <div className="mt-2 space-y-2 text-slate-700 dark:text-slate-300">
                      {selectedNotification.detalles.proyecto && (
                        <p>
                          <strong>Proyecto:</strong>{" "}
                          {selectedNotification.detalles.proyecto}
                        </p>
                      )}
                      {selectedNotification.detalles.entregaId && (
                        <p>
                          <strong>ID Entrega:</strong>{" "}
                          {selectedNotification.detalles.entregaId}
                        </p>
                      )}
                      {selectedNotification.detalles.fechaEntrega && (
                        <p>
                          <strong>Fecha Entrega:</strong>{" "}
                          {formatDate(
                            selectedNotification.detalles.fechaEntrega
                          )}
                        </p>
                      )}
                      {selectedNotification.detalles.productos && (
                        <div>
                          <strong>Productos:</strong>
                          <ul className="list-disc list-inside mt-1 ml-4">
                            {selectedNotification.detalles.productos.map(
                              (producto, index) => (
                                <li key={index}>
                                  {producto.cantidad} - {producto.descripcion}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-500">
                    <p>
                      Generada:{" "}
                      {formatDate(selectedNotification.fechaGeneracion)}
                    </p>
                    {selectedNotification.fechaLectura && (
                      <p>
                        Leída: {formatDate(selectedNotification.fechaLectura)}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {!selectedNotification.leida && (
                      <button
                        onClick={() => {
                          markAsRead(selectedNotification.id);
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Marcar como leída
                      </button>
                    )}
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsView;
