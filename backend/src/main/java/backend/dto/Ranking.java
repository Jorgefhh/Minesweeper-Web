package backend.dto;

import java.time.Instant;

import org.springframework.data.relational.core.mapping.Column;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Ranking {
    //Recordar: DTO debe seguir el nombre del resultset
    @Column ("nombreUsuarios")
    private String username;
    @Column ("Pais")
    private String pais;
    @Column ("mejor_tiempo")
    private double tiempo;
    @Column ("fecha_record")
    private Instant fecha;
}
