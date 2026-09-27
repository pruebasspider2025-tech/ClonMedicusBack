// src/services/SocketService.js
const { emitEvent } = require('../socket');

class SocketService {
  // ============================================
  // EVENTOS DE CLÍNICA
  // ============================================

  /**
   * Notifica creación de una nueva cita
   */
  static notifyNuevaCita(citaData, userInfo) {
    emitEvent('nueva-cita', {
      ...citaData,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  /**
   * Notifica actualización del estado de una cita
   */
  static notifyCitaEstadoActualizado(data, userInfo) {
    emitEvent('cita-estado-actualizado', {
      ...data,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  /**
   * Notifica cancelación de una cita
   */
  static notifyCitaCancelada(data, userInfo) {
    emitEvent('cita-cancelada', {
      ...data,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  /**
   * Notifica reordenamiento de citas
   */
  static notifyCitasReordenadas(data, userInfo) {
    emitEvent('citas-reordenadas', {
      ...data,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  /**
   * Notifica pago procesado
   */
  static notifyPagoProcesado(data, userInfo) {
    emitEvent('pago-procesado', {
      ...data,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  // ============================================
  // EVENTOS GENÉRICOS (compatibilidad)
  // ============================================

  static notifyClientUpdate(clientData, userInfo) {
    emitEvent('cliente-actualizado', {
      ...clientData,
      timestamp: new Date().toISOString(),
    });
  }

  static notifyPendingPayment(paymentData, userInfo) {
    emitEvent('pago-pendiente-actualizado', {
      ...paymentData,
      timestamp: new Date().toISOString(),
    });
  }

  static notifyPendingDelivery(deliveryData, userInfo) {
    emitEvent('entrega-pendiente-actualizada', {
      ...deliveryData,
      timestamp: new Date().toISOString(),
    });
  }

  static notifyCashRegister(cashData, userInfo) {
    emitEvent('caja-actualizada', {
      ...cashData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notifica actualización general (para refrescar dashboards)
   */
  static notifyRefresh(module, userInfo) {
    emitEvent('refresh', {
      module,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = SocketService;