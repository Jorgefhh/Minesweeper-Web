package backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor // Jackson siempre lo pide idk
@AllArgsConstructor
public class StatsRequest {
    private Integer idPartida;
    private Integer idModo;
    private double tiempo;
    private Integer clicksIzquierdo;
    private Integer clicksDerecho;
    private List<Traza> listaTraza;
}
