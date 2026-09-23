package backend.dto;

import java.time.LocalDateTime;

public record ErrorResponse(
        String status, // ERROR
        String codigo, // VALIDACION FALLIDA
        String descripcion, // ALGUN TEXTO AMIGABLE
        LocalDateTime timestamp // REGISTRO DE LA FECHA EN DONDE OCURRIÓ EL ERROR.

) {
    public ErrorResponse(String status, String codigo, String descripcion) {
        this(status, codigo, descripcion, LocalDateTime.now());
    }

}
