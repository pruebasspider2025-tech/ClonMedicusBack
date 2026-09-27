// src/services/SocketService.js
const { emitEvent } = require('../socket');

class SocketService {
  // ============================================
  // EVENTOS DE CLÍNICA
  // ============================================

  static notifyNuevaCita(citaData, userInfo) {
    emitEvent('nueva-cita', {
      ...citaData,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  static notifyCitaEstadoActualizado(data, userInfo) {
    emitEvent('cita-estado-actualizado', {
      ...data,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  static notifyCitaCancelada(data, userInfo) {
    emitEvent('cita-cancelada', {
      ...data,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  static notifyCitasReordenadas(data, userInfo) {
    emitEvent('citas-reordenadas', {
      ...data,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  static notifyPagoProcesado(data, userInfo) {
    emitEvent('pago-procesado', {
      ...data,
      timestamp: new Date().toISOString(),
      usuario: userInfo?.username || 'sistema',
    });
  }

  // ============================================
  // EVENTOS DE MENSAJES
  // ============================================

  /**
   * Notifica al DESTINATARIO que recibió un mensaje nuevo.
   * @param {object} data - { mensaje, emisorId, receptorId, conversacionId }
   * @param {number} receptorId - a quién le llega
   */
  static notifyNuevoMensaje(data, receptorId) {
    if (!receptorId) return;
    emitEvent('nuevo-mensaje', {
      ...data,
      timestamp: new Date().toISOString(),
    }, { userId: receptorId });
  }

  /**
   * Notifica al EMISOR que sus mensajes fueron leídos por el contacto.
   */
  static notifyMensajesLeidos(data, emisorId) {
    if (!emisorId) return;
    emitEvent('mensajes-leidos', {
      ...data,
      timestamp: new Date().toISOString(),
    }, { userId: emisorId });
  }

  // ============================================
  // EVENTOS GENÉRICOS
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

  static notifyRefresh(module, userInfo) {
    emitEvent('refresh', {
      module,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = SocketService;