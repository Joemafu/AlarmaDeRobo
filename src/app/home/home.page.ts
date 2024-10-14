import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Vibration } from '@ionic-native/vibration/ngx';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

import { Motion } from '@capacitor/motion';
import { Haptics } from '@capacitor/haptics';
import { CapacitorFlash } from '@capgo/capacitor-flash';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [ IonButtons, IonButton, CommonModule, FormsModule ]
})
export class HomePage implements OnInit, OnDestroy {

  auth = inject(AuthService);
  authService = inject(AuthService);
  router = inject(Router);
  vibration = inject(Vibration);

  audioIzquierda = './../../assets/sound/s1.ogg';
  audioDerecha = './../../assets/sound/s2.ogg';
  audioVertical = './../../assets/sound/s3.ogg';
  audioHorizontal = './../../assets/sound/s4.ogg';
  audioPassword = './../../assets/sound/s5.ogg';

  posicionActualCelular = 'acostado';
  accionActivo: boolean = false;
  x: any = 0;
  y: any = 0;
  z: any = 0;
  public estaBloqueado: boolean = false;
  //contador=0;

  public subscription: Subscription = new Subscription();
  error: string = 'ok';
  options = {
    intensity: 100,
  }

  constructor() {}

  async formAlert() {
    if(this.estaBloqueado)
    {
      const { value: password } = await Swal.fire({
        title: 'Ingrese su contraseña',
        input: 'password',
        heightAuto: false,
        inputAttributes: {
          autocapitalize: 'off',
        },
        confirmButtonText: 'DESACTIVAR',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      if (password == this.authService.currentPass) 
      {
        this.cambiarBloqueado();
      }
      else
      {
        this.incorrecto();
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    Motion.removeAllListeners();
  }

  startListeningToMotion() {
    Motion.addListener('accel', (event) => {
      const { x, y, z } = event.acceleration;
      this.x = x;
      this.y = y;
      this.z = z;
      this.handleMotionDetection(this.x, this.y, this.z);
    });
  }

  cambiarBloqueado() {

    this.estaBloqueado = !this.estaBloqueado;
    if (this.estaBloqueado) {
      this.startListeningToMotion();
      //this.contador=0;
    } else {
      Motion.removeAllListeners();
    }
  }

    //calibrado por Mi
/*     handleMotionDetection(x: number, y: number, z: number) {
      if (
        this.contador==0 &&
      x > 5 &&
        this.accionActivo == false
      ) {
        this.izquierda();
        this.contador++;
      } else if (
        this.contador==1 &&
      x < -5 &&
        this.accionActivo == false
      ) {
        this.derecha();
        this.contador++;
      } else if (
        this.contador==2 &&
        this.accionActivo == false
      ) {
        y >= 7 || y <= -7;
        this.vertical();
        this.contador++;
      } else if (
        z >= 7 &&
        this.contador==3 &&
        this.accionActivo == false
      ) {
        this.horizontal();
        this.contador++;
      }
    } */

/*   //Calibrado por gpt  v2
  handleMotionDetection(x: number, y: number, z: number) {
    // Detectar movimiento a la izquierda
    if (
      x > 5 &&
      x < 10 &&
      this.posicionActualCelular !== 'Izquierda' &&
      this.accionActivo === false &&
      this.posicionActualCelular !== 'vertical'
    ) {
      this.izquierda();
    } 
    // Detectar movimiento a la derecha
    else if (
      x < -5 &&
      x > -10 &&
      this.posicionActualCelular !== 'Derecha' &&
      this.accionActivo === false &&
      this.posicionActualCelular !== 'vertical'
    ) {
      this.derecha();
    } 
    // Detectar si el dispositivo está en posición vertical
    else if (
      (y >= 9 || y <= -10) &&
      this.posicionActualCelular !== 'Vertical' &&
      this.accionActivo === false
    ) {
      this.vertical();
    } 
    // Detectar si se coloca el dispositivo en posición horizontal
    else if (
      z >= 9 && // Sensor Z indica que el dispositivo está en posición horizontal
      this.posicionActualCelular === 'Vertical' // Asegúrate de que el dispositivo estaba en vertical antes de cambiar a horizontal
    ) {
      this.horizontal();
    }
  } */

  //calibrado por gpt
  /* handleMotionDetection(x: number, y: number, z: number) {
    if (
      x < -5 && // Movimiento hacia la izquierda
      x > -10 &&
      this.posicionActualCelular != 'Izquierda' &&
      this.accionActivo == false
    ) {
      this.izquierda();
    } else if (
      x > 5 && // Movimiento hacia la derecha
      x < 10 &&
      this.posicionActualCelular != 'Derecha' &&
      this.accionActivo == false
    ) {
      this.derecha();
    } else if (
      (y >= 9 || y <= -10) && // Levantamiento vertical
      this.posicionActualCelular != 'Vertical' &&
      this.accionActivo == false
    ) {
      this.vertical();
    } else if (
      z >= 9 && // Levantamiento horizontal
      x >= -1 &&
      x <= 1 &&
      y >= -1 &&
      y <= 1 &&
      this.posicionActualCelular != 'Horizontal' &&
      this.posicionActualCelular != 'plano' &&
      this.accionActivo == false
    ) {
      this.horizontal();
    }
  } */

  handleMotionDetection(x: number, y: number, z: number) {
    if (
      x > 5 &&
      x < 10 &&
      this.posicionActualCelular != 'Izquierda' &&
      this.accionActivo == false
    ) {
      this.izquierda();
    } else if (
      x < -5 &&
      x > -10 &&
      this.posicionActualCelular != 'Derecha' &&
      this.accionActivo == false
    ) {
      this.derecha();
    } else if (
      (y >= 9 || y <= -10) &&
      this.posicionActualCelular != 'Vertical' &&
      this.accionActivo == false
    ) {
      this.vertical();
    } else if (
      z >= 9 &&
      y >= -1 &&
      y <= 1 &&
      x <= 1 &&
      x >= -1 &&
      this.posicionActualCelular != 'Horizontal' &&
      this.posicionActualCelular != 'plano' &&
      this.accionActivo == false
    ) {
      this.horizontal();
    }
  }

  async playSound(soundFile: string) {
    const audio = new Audio(`assets/sounds/${soundFile}`);
    audio.play();
    audio.onended = () => {
      this.accionActivo = false;
    };
  }

  async turnOnLight(miliSecond: number) {
    await CapacitorFlash.switchOn(this.options);
    setTimeout(() => {
      CapacitorFlash.switchOff();
    }, miliSecond);
  }

  async vibrate(miliSecond: number) {
    Haptics.vibrate({ duration: miliSecond });
  }



  izquierda() {
    this.accionActivo = true;
    this.posicionActualCelular = 'Izquierda';
    this.vibrate(2000);
    this.playSound(this.audioIzquierda);
  }

  derecha() {
    this.accionActivo = true;
    this.posicionActualCelular = 'Derecha';
    this.vibrate(2000);
    this.playSound(this.audioDerecha);
  }

  vertical() {
    this.accionActivo = true;
    this.posicionActualCelular = 'Vertical';
    this.turnOnLight(5000);
    this.playSound(this.audioVertical);
  }

  horizontal() {
    this.accionActivo = true;
    this.posicionActualCelular = 'Horizontal';
    this.vibrate(5000);
    this.playSound(this.audioHorizontal);
  }

  incorrecto() {
    this.accionActivo = true;
    this.vibrate(5000);
    this.turnOnLight(5000);
    this.playSound(this.audioPassword);
  }
}
