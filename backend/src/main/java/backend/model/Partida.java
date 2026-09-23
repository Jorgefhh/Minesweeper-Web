package backend.model;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table("Partidas")
@Getter
@Setter
@NoArgsConstructor
public class Partida {
    @Id
    @Column("idPartida")
    private Integer id;

    @Column("semilla")
    private String semilla;

    @JsonProperty("fecha_partida")
    private Instant fechaPartida;

    private Double tiempo;

    private Estado estado;

    @Column("click_izq")
    private Integer clickIzq;

    @Column("click_der")
    private Integer clickDer;

    @Column("Gamemode_idModo")
    private Integer idModo;

    @Column("Usuarios_idUsuarios")
    private Integer usuarioId;

    @Transient
    private List<Integer> semillaArray;

    public void setSemillas(List<Integer> lista) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.semilla = mapper.writeValueAsString(lista);
            this.semillaArray = lista;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al convertir la semilla a JSON", e);
        }
    }

    public List<Integer> getSemillas() {
        if (semillaArray != null) {
            return semillaArray;
        }

        if (semilla == null || semilla.isBlank()) {
            return List.of();
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            this.semillaArray = mapper.readValue(semilla, new TypeReference<List<Integer>>() {
            });
            return semillaArray;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al convertir el JSON de la semilla", e);
        }
    }
}
