package backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import backend.dto.Ranking;
import backend.repository.ClasificacionRepository;

@Service
public class ClasificacionService {
    // Atributos que usará, en este caso repository
    ClasificacionRepository clasificacionRepository;

    // Inyección de dependencias:
    public ClasificacionService(ClasificacionRepository clasificacionRepository) {
        this.clasificacionRepository = clasificacionRepository;
    }

    public List<Ranking> obtenerConsulta(String dificultad, String pais, String fecha) {
        // Armo la lógica para obtener desde el repository:
        // Quizas hacer una query y pasarle los parametros, pueda ser una opcion
        List<Ranking> ranking = clasificacionRepository.buscarconFiltros(dificultad, pais, fecha);
        // Solo los atributos que necesito devuelvo:
        System.out.println(ranking);
        // Por ahora retornamos una lista vacía para evitar errores
        return ranking;
    }
}

