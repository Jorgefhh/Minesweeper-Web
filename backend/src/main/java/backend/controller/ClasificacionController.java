package backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.dto.Ranking;
import backend.service.ClasificacionService;

@RestController
@RequestMapping("api/clasificacion")
/*
 * Un ejemplo de lo que será esto:
 * GET /api/clasificacion?modo=facil&pais=AR&fecha=2023-10
 */

public class ClasificacionController {
    // Usara objetos service:
    private final ClasificacionService clasificacionService;

    // IOC
    public ClasificacionController(ClasificacionService clasificacionService) {
        this.clasificacionService = clasificacionService;
    }

    // Uso el metodo http get
    @GetMapping
    public ResponseEntity<List<Ranking>> obtenerClasificacion(
            @RequestParam(name = "modo", required = true) String dificultad,
            @RequestParam(name = "pais", required = false) String pais,
            @RequestParam(name = "fecha", required = false) String fecha) {

        // Le pasamos los parámetros directamente al método del service
        List<Ranking> clasificaciones = clasificacionService.obtenerConsulta(dificultad, pais, fecha);
        // En un futuro debere pensar acerca de los casos de excepciones que pueda
        // ocurrir
        return ResponseEntity.ok(clasificaciones);
    }
}

