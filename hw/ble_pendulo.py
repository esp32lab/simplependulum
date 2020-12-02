import bluetooth
import random
import struct
import time
from ble_advertising import advertising_payload

from micropython import const

import time
from machine import Pin

servicoUuid         = 0xBEEF;
caracteristicaUuid  = 0xFEED;

_IRQ_CENTRAL_CONNECT = const(1)
_IRQ_CENTRAL_DISCONNECT = const(2)

_PENDULO_UUID = bluetooth.UUID(servicoUuid)
_PENDULO_CHAR = (
    bluetooth.UUID(caracteristicaUuid),
    bluetooth.FLAG_READ | bluetooth.FLAG_NOTIFY,
)
_PENDULO_SERVICE = (
    _PENDULO_UUID,
    (_PENDULO_CHAR,),
)


class BLEPendulo:
    
    def __init__(self, ble, name="PenduloSensor"):
        self._ble = ble
        self._ble.active(True)
        self._ble.irq(self._irq)
        ((self._handle,),) = self._ble.gatts_register_services((_PENDULO_SERVICE,))
        self._connections = set()
        self._payload = advertising_payload(name=name, services=[_PENDULO_UUID])
        self.status = Pin(2,Pin.OUT)
        self._advertise()

    def _irq(self, event, data):
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, _, _ = data
            self._connections.add(conn_handle)
            self.status.off() 
            print('Conectado')
        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, _, _ = data
            self._connections.remove(conn_handle)
            self._advertise()
            print('Desconectado')

    def set_valor(self, valor):
        self._ble.gatts_write(self._handle,struct.pack('<h', valor))
        for conn_handle in self._connections:
            self._ble.gatts_notify(conn_handle, self._handle)

    def _advertise(self, interval_us=30000):
        self._ble.gap_advertise(interval_us, adv_data=self._payload)
        self.status.on()
        print('Visivel')
    
    def is_connected(self):
        return len(self._connections) > 0    


if __name__ == "__main__":
    ble = bluetooth.BLE()
    pendulo = BLEPendulo(ble)
    t0 = time.ticks_ms()

    while True:
        tn = time.ticks_ms()
        td = time.ticks_diff(tn,t0)
        t0 = tn
        pendulo.set_valor(td)
        print(td)
        time.sleep(2)