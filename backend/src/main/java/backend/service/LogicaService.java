package backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import backend.dto.StatsRequest;
import backend.model.Juego;
import backend.model.Partida;
import backend.model.Tablero;
import backend.service.SeedService.TableroConfig;

@Service
public class LogicaService {

    public Juego simularJuego(Partida partida, StatsRequest stats) {
        TableroConfig dimensiones = SeedService.obtenerConfiguracion(partida.getIdModo());
        Tablero tablero = new Tablero(dimensiones);
        tablero.generar(partida.getSemillas());
        // Creo la instancia de juego una vez tengo el tablero :
        Juego juego = new Juego(tablero);
        juego.jugarTablero(stats.getListaTraza());
        return juego;
    }

}
