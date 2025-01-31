import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { Haptics } from '@capacitor/haptics';
import { CapacitorFlash } from '@capgo/capacitor-flash';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonButton, CommonModule, FormsModule]
})
export class HomePage implements OnInit, OnDestroy {

  auth = inject(AuthService);
  router = inject(Router);
  platform = inject(Platform);
  backButtonSubscription: any;

  audioIzquierda = './../../assets/sound/s1.ogg';
  audioDerecha = './../../assets/sound/s2.ogg';
  audioVertical = './../../assets/sound/s3.ogg';
  audioHorizontal = './../../assets/sound/s4.ogg';
  audioPassword = './../../assets/sound/s5.ogg';

  posicionActualCelular = 'acostado';
  accionActivo: boolean = false;
  public estaBloqueado: boolean = false;

  error: string = 'ok';
  options = {
    intensity: 100,
  };

  constructor() {}

  async formAlert() {
    if (this.estaBloqueado) {
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
      if (password === this.auth.currentPass) {
        this.cambiarBloqueado();
      } else {
        this.incorrecto();
      }
    }
  }

  async mantenerPantallaActiva() {
    if (this.estaBloqueado) {
      await KeepAwake.keepAwake();
    } else {
      await KeepAwake.allowSleep();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnInit() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      if(this.estaBloqueado) {
        this.backButtonSubscription.preventDefault();
      }
    });
  }

  ngOnDestroy() {
    this.stopListeningToOrientation();
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  cambiarBloqueado() {
    this.estaBloqueado = !this.estaBloqueado;
    this.mantenerPantallaActiva();
    if (this.estaBloqueado) {
      this.startListeningToOrientation();
    } else {
      this.stopListeningToOrientation();
    }
  }

  startListeningToOrientation() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.handleOrientationEvent.bind(this));
    } else {
      console.warn('DeviceOrientationEvent no está disponible en este dispositivo.');
    }
  }

  stopListeningToOrientation() {
    window.removeEventListener('deviceorientation', this.handleOrientationEvent.bind(this));
  }

  handleOrientationEvent(event: DeviceOrientationEvent) {
    const { alpha, beta, gamma } = event;

    // Procesar los valores de orientación
    this.handleOrientationDetection(alpha, beta, gamma);
  }

  handleOrientationDetection(alpha: number | null, beta: number | null, gamma: number | null) {
    if (gamma !== null && beta !== null) {
      // Detectar inclinación a la izquierda
      if (gamma > 45 && this.posicionActualCelular !== 'Derecha' && !this.accionActivo) {
        this.derecha();
      } 
      // Detectar inclinación a la derecha
      else if (gamma < -45 && this.posicionActualCelular !== 'Izquierda' && !this.accionActivo) {
        this.izquierda();
      } 
      // Detectar posición vertical
      else if (beta > 45 && this.posicionActualCelular !== 'Vertical' && !this.accionActivo) {
        this.vertical();
      } 
      // Detectar posición horizontal
      else if (beta < -45 && this.posicionActualCelular !== 'Horizontal' && !this.accionActivo) {
        this.horizontal();
      }
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
