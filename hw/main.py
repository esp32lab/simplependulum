import machine, time
from machine import Pin, Timer
from ble_pendulo import BLEPendulo
import bluetooth

def interrupcao(timer):
    global tempos
    tempos.append(time.ticks_ms())

def debounce(pin):
    global timer               
    timer.init(mode=Timer.ONE_SHOT,period=200,callback=interrupcao)
    
timer = Timer(0)
tempos = []
periodos = []

p21 = Pin(21,Pin.IN,Pin.PULL_UP)
p21.irq(trigger=Pin.IRQ_RISING,handler=debounce)

b1 = bluetooth.BLE()
ble = BLEPendulo(b1)

while True:
    
    if len(tempos)==3:
        estado = machine.disable_irq()
        t0, tf = tempos[0], tempos[2]
        tempos.clear()
        tempos.append(tf)
        machine.enable_irq(estado)
        dt = time.ticks_diff(tf,t0)
        periodos.append(dt)
        
        if len(periodos)==5:
            periodo_medio = round(sum(periodos)/len(periodos))
            periodos.clear()
            ble.set_valor(periodo_medio)
        
