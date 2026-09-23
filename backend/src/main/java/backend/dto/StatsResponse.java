package backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    // Esto en un futuro decidire su formato:
    // GANE O PIERDA SE MANDAN IGUAL:
    private int clickIzq;
    private int clickDer;
    private double tiempo;
    private int experiencia;
}
