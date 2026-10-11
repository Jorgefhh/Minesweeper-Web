package backend.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import backend.dto.Ranking;
import backend.model.Clasificacion;
import backend.model.ClasificacionId;

@Repository
public interface ClasificacionRepository extends CrudRepository<Clasificacion, ClasificacionId> {

    // Para resolver el problema de los parametros variables 1 a 3
    // Se puede usar la sentencia IS NULL
    @Query("""
            SELECT u.nombreUsuarios, u.pais, c.mejor_tiempo, c.fecha_record
            FROM Clasificacion c JOIN Usuarios u ON
            c.Usuarios_idUsuarios = u.idUsuarios
            JOIN Gamemode g ON c.Gamemode_idModo = g.idModo
            WHERE (g.nombre = :dificultad)
            AND (:pais IS NULL OR u.pais = :pais)
            AND (:fecha IS NULL OR DATE_FORMAT(c.fecha_record, '%Y-%m') = :fecha)
            ORDER BY c.fecha_record DESC LIMIT 25
            """)
    List<Ranking> buscarconFiltros(
            @Param("dificultad") String dificultad,
            @Param("pais") String pais,
            @Param("fecha") String fecha);
}
