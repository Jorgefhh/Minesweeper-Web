package backend.model;

import org.springframework.data.relational.core.mapping.Column;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode
public class ClasificacionId {
    @Column("Usuarios_idUsuarios")
    private final Integer usuarioId;
    @Column("Gamemode_idModo")
    private final Integer idModo;
}
