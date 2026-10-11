package backend.model;

import java.util.List;

import backend.service.SeedService.TableroConfig;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Tablero {
    private int filas;
    private int columnas;
    private int minas;
    private String partida[][];
    private int banderas[][];

    // Ahora pongo el constructor:
    public Tablero(TableroConfig configuracion) {
        this.filas = configuracion.filas();
        this.columnas = configuracion.columnas();
        this.minas = configuracion.minas();
        this.partida = new String[this.filas][this.columnas];
        // Java lo inicializa con cero por defecto;
        this.banderas = new int[this.filas][this.columnas];
    }

    public void generar(List<Integer> semillas) {
        int k = 0;
        for (int i = 0; i < this.filas; i++) {
            for (int j = 0; j < this.columnas; j++) {
                int chord1D = i * this.columnas + j;
                if (k < semillas.size() && chord1D == semillas.get(k)) {
                    k++;
                    this.partida[i][j] = "X";
                    continue;
                }
                this.partida[i][j] = "V";
            }
        }
    }

    public void aplicarBandera(int fila, int columna) {
        //Comprobación de los límites
        if (!(fila >= 0 && fila < this.getFilas())
                || !(columna >= 0 && columna < this.getColumnas())) {
            return;
        }
        if (this.banderas[fila][columna] == 1)
            this.banderas[fila][columna] = 0;
        else {
            this.banderas[fila][columna] = 1;
        }
    }

    public void setCelda(int fila, int columna, String valor) {
        this.partida[fila][columna] = valor;
    }

}
