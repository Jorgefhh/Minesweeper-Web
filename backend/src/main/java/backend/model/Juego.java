package backend.model;

import java.util.List;

import backend.dto.Traza;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Juego {
    private Estado estado;
    private int clicksIzquierdos = 0;
    private int clicksDerechos = 0;
    private Long tiempo;
    private int aciertos = 0;
    private Tablero tablero;
    private int experiencia = 0;
    private int shifts[][] = {
            { -1, -1 }, { -1, 0 }, { -1, 1 }, // fila de arriba
            { 0, -1 }, { 0, 1 }, // misma fila
            { 1, -1 }, { 1, 0 }, { 1, 1 } // fila de abajo
    };

    public Juego(Tablero tablero) {
        this.tablero = tablero;
        this.estado = Estado.EN_CURSO;
    }

    public void jugarTablero(List<Traza> listaTraza) {
        int indice1D;
        // Contar el tipo de click según el que figura en traza:
        for (Traza traza : listaTraza) {
            if (!(this.estado == Estado.EN_CURSO)) {
                break;
            }
            indice1D = traza.getCoordenadas();
            int fila = indice1D / this.tablero.getColumnas();
            int columna = indice1D % this.tablero.getColumnas();
            if (traza.getTipo().equals("izquierdo")) {
                this.clicksIzquierdos++;
                aplicarJugada(fila, columna);
            } else {
                this.clicksDerechos++; // dudoso porque confío en el frontd.
                this.tablero.aplicarBandera(fila, columna);
            }
        }
    }

    public void aplicarJugada(int fila, int columna) {
        // Si me salgo de los limites:
        if (!(fila >= 0 && fila < this.tablero.getFilas())
                || !(columna >= 0 && columna < this.tablero.getColumnas())) {
            return;
        }
        // Si la coordenada tiene una bandera, no jugar:
        if (this.tablero.getBanderas()[fila][columna] == 1) {
            return;
        }

        // Si toco una mira => PERDER
        if (this.tablero.getPartida()[fila][columna].equals("X")) {
            this.estado = Estado.PERDIDA;
            return;
        }

        // Recolecto banderas adyacentes: Teóricas y las provistas por el user:
        BanderasAdyacentes banderas = flagAdy(fila, columna);

        // ESCENARIO: CELDA NO REVELADA "V" => REVELAR
        if (this.tablero.getPartida()[fila][columna].equals("V")) {
            this.aciertos++;
            // Ahora utilizo las banderas del juego:
            if (banderas.realFlag() > 0) { // Si hay más de una bandera alrededor
                this.tablero.setCelda(fila, columna, String.valueOf(banderas.realFlag()));
            } else {
                this.tablero.setCelda(fila, columna, "0");
                // PROPAGACIÓN RECURSIVA:
                for (int[] d : this.shifts) {
                    aplicarJugada(fila + d[0], columna + d[1]);
                }
            }

        }
        // NUEVO ESCENARIO: Click en celda numerica ya revelada
        // Posible respuesta: Algoritmo llamado "Acorde".
        else {
            chording(fila, columna, banderas);
        }
        // Finalmente verifico si perdio la partida:
        int totalCeldas = this.tablero.getColumnas() * this.tablero.getFilas();
        if (this.aciertos == totalCeldas - this.tablero.getMinas()) {
            this.estado = Estado.GANADA;
        }

        return;
    }

    public BanderasAdyacentes flagAdy(int fila, int columna) {
        int realFlag = 0, userFlag = 0, filaAdy, colAdy;
        for (int[] d : this.shifts) {
            filaAdy = fila + d[0];
            colAdy = columna + d[1];
            // Si no me fui de los limites:
            if (!(filaAdy >= 0 && filaAdy < this.tablero.getFilas())
                    || !(colAdy >= 0 && colAdy < this.tablero.getColumnas())) {
                continue;
            }

            // Verifico las bombas ahora sí:
            if (this.tablero.getPartida()[filaAdy][colAdy].equals("X")) {
                realFlag++;
            }
            if ((this.tablero.getBanderas()[filaAdy][colAdy] == 1)) {
                userFlag++;
            }

        }

        return new BanderasAdyacentes(realFlag, userFlag);
    }

    public void chording(int fila, int columna, BanderasAdyacentes banderas) {
        if ((banderas.userFlag() != (banderas.realFlag())) || banderas.userFlag() == 0) {
            return;
        }

        // Juego por las celdas adyacentes:
        for (int[] d : this.shifts) {
            int nuevaFila = fila + d[0];
            int nuevaCol = columna + d[1];
            if (!(nuevaFila >= 0 && nuevaFila < this.tablero.getFilas())
                    || !(nuevaCol >= 0 && nuevaCol < this.tablero.getColumnas())) {
                // Si me salgo de los límites, la coordenada es invalida y no me trago una
                // excepcion
                continue;
            }

            boolean tieneBandera = this.tablero.getBanderas()[nuevaFila][nuevaCol] == 1;
            String valor = this.tablero.getPartida()[nuevaFila][nuevaCol];
            if ((valor.equals("V") && !tieneBandera) || valor.equals("X") && !tieneBandera) {
                aplicarJugada(nuevaFila, nuevaCol);
            }
        }
    }

}
