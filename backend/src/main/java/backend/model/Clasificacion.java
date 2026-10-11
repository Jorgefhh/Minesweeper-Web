package backend.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Embedded;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Getter;
import lombok.Setter;

@Table("Clasificacion")
@Getter
@Setter
public class Clasificacion implements Persistable<ClasificacionId> {
    @Id
    @Embedded.Nullable // Le dice a spring que desglose los argumentos
    // Esta supuestamente es la forma en que debería permitir usar claves compuestas
    // con spring jdbc data
    private ClasificacionId id;
    @Column("mejor_tiempo")
    private Double mejorTiempo;
    @Column("fecha_record")
    private Instant fechaRecord;

    // Este campo NO se guarda en la base de datos (es transitorio).
    // Sirve para decirle a Spring si debe hacer INSERT o UPDATE.
    @Transient
    private boolean esNuevo = false;

    // Constructor para entidad NUEVA (primera vez → INSERT)
    public Clasificacion(ClasificacionId id, Double mejorTiempo, Instant fechaRecord) {
        this.id = id;
        this.mejorTiempo = mejorTiempo;
        this.fechaRecord = fechaRecord;
        this.esNuevo = true; // Le decimos a Spring: "esto es nuevo, hacé INSERT"
    }

    // Constructor sin argumentos para Spring (cuando lee de la BD, no es nuevo)
    public Clasificacion() {
        this.esNuevo = false;
    }

    @Override
    public boolean isNew() {
        return esNuevo;
    }
}
