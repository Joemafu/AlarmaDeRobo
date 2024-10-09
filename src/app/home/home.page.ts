import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonNavLink,
  IonAlert,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {
  DeviceMotion,
  DeviceMotionAccelerationData,
} from '@ionic-native/device-motion/ngx';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonAlert,
    IonNavLink,
    IonIcon,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class HomePage implements OnInit {

  auth = inject(AuthService);
  authService = inject(AuthService);
  router = inject(Router);
  deviceMotion = inject(DeviceMotion);
  flashlight = inject(Flashlight);
  vibration = inject(Vibration);

  audioIzquierda = './../../assets/sound/s1.opus';
  audioDerecha = './../../assets/sound/s2.opus';
  audioVertical = './../../assets/sound/s3.opus';
  audioHorizontal = './../../assets/sound/s4.opus';

  posicionActualCelular = 'plano';
  accionActivo: boolean = false;
  accelerationX: any;
  accelerationY: any;
  accelerationZ: any;
  public estaBloqueado: boolean = false;

  public subscription: Subscription = new Subscription();

  constructor() {}

  async formAlert() {
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

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
  //Init - Destroy
  ngOnInit() {}
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  //Main
  playSound(soundFile: string) {
    const audio = new Audio(`assets/sounds/${soundFile}`);
    audio.play();
    audio.onended = () => {
      this.accionActivo = false;
    };
  }


  
  turnOnLight(miliSecond: number) {
    this.flashlight.switchOn();
    setTimeout(() => {
      this.flashlight.switchOff();
    }, miliSecond);
  }
  vibrate(miliSecond: number) {
    this.vibration.vibrate(miliSecond);
  }
  cambiarBloqueado() {
    if (this.estaBloqueado) {
      this.estaBloqueado = false;
      this.stopMotionHandle();
    } else {
      this.estaBloqueado = true;
      this.startMotionHandle();
    }
  }
  startMotionHandle() {
    this.subscription = this.deviceMotion
      .watchAcceleration({ frequency: 300 })
      .subscribe((acceleration: DeviceMotionAccelerationData) => {
        console.log(acceleration);
        this.accelerationX = Math.floor(acceleration.x);
        this.accelerationY = Math.floor(acceleration.y);
        this.accelerationZ = Math.floor(acceleration.z);
        if (
          acceleration.x > 5 &&
          acceleration.x < 10 &&
          this.posicionActualCelular != 'Izquierda' &&
          this.accionActivo == false
        ) {
          this.izquierda();
        } else if (
          acceleration.x < -5 &&
          acceleration.x > -10 &&
          this.posicionActualCelular != 'Derecha' &&
          this.accionActivo == false
        ) {
          this.derecha();
        } else if (
          (acceleration.y >= 9 || acceleration.y <= -10) &&
          this.posicionActualCelular != 'Vertical' &&
          this.accionActivo == false
        ) {
          this.vertical();
        } else if (
          acceleration.z >= 9 &&
          acceleration.y >= -1 &&
          acceleration.y <= 1 &&
          acceleration.x <= 1 &&
          acceleration.x >= -1 &&
          this.posicionActualCelular != 'Horizontal' &&
          this.posicionActualCelular != 'plano' &&
          this.accionActivo == false
        ) {
          this.horizontal();
        }
      });
  }
  // (acceleration.z >= 9 && (acceleration.y >= -1 && acceleration.y <= 1) && (acceleration.x >= -1 && acceleration.x <= 1))
  stopMotionHandle() {
    this.subscription.unsubscribe();
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
    this.vibrate(5000);
    this.turnOnLight(5000);
    this.playSound(this.audioHorizontal);
  }
}
