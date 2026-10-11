package backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.dto.PartidaCreada;
import backend.dto.StatsRequest;
import backend.dto.StatsResponse;
import backend.model.Usuario;
import backend.service.PartidaService;

@RestController
@RequestMapping("api/partidas")
public class PartidaController {
    private final PartidaService partidaService;

    public PartidaController(PartidaService partidaService) {
        this.partidaService = partidaService;
    }

    // Conceptualmente debe ser un POST.
    @PostMapping
    public ResponseEntity<PartidaCreada> crearPartida(@AuthenticationPrincipal Usuario usuarioActual,
            @RequestParam String dificultad) {
        return ResponseEntity.ok(partidaService.registrarPartida(usuarioActual, dificultad));
    }

    /*
     * devuelve:
     * {
     * "idPartida": 42,
     * "semillas": [3, 7, 9]
     * }
     */
    // Ocurre cuando el jugador finaliza la partida.
    @PatchMapping
    public ResponseEntity<StatsResponse> guardarPartida(@AuthenticationPrincipal Usuario usuario,
            @RequestBody StatsRequest stats) {
        return ResponseEntity.ok(partidaService.validarPartida(usuario, stats));
    }
}
