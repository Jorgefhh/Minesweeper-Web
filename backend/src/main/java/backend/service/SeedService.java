package backend.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class SeedService {
    public static List<Integer> crearSemillas(String dificultad) {
        TableroConfig config = obtenerConfiguracion(dificultad);
        int rango = config.filas() * config.columnas();

        List<Integer> mazo = new ArrayList<>();
        for (int i = 0; i < rango; i++) {
            mazo.add(i);
        }
        shuffle(mazo);
        // Ordeno la sublista
        List<Integer> subMazo = new ArrayList<>(mazo.subList(0, config.minas()));
        Collections.sort(subMazo);
        return subMazo;
    }

    public static List<Integer> shuffle(List<Integer> mazo) {
        for (int i = mazo.size() - 1; i > 0; i--) {
            int j = (int) Math.floor(Math.random() * (i + 1));
            Collections.swap(mazo, i, j);
        }
        return mazo;
    }

    // Un record crea una clase de manera compacta con métodos y atributos en una
    // sola linea
    public record TableroConfig(int filas, int columnas, int minas) {
    }

    private static final Map<String, TableroConfig> CONFIGURACIONES = Map.of(
            "facil", new TableroConfig(9, 9, 10),
            "intermedio", new TableroConfig(19, 16, 40),
            "dificil", new TableroConfig(16, 30, 99));

    // METODOS CON SOBRECARGA:
    public static TableroConfig obtenerConfiguracion(String dificultad) {
        String clave;
        if (dificultad == null) {
            clave = "";
        } else {
            clave = dificultad.trim().toLowerCase(Locale.ROOT);
        }
        // Busco en el map en base a la clave string
        TableroConfig config = CONFIGURACIONES.get(clave);
        if (config == null) {
            throw new IllegalArgumentException("Dificultad inválida. Usa: facil, medio o dificil");
        }
        return config;
    }

    ///
    public static TableroConfig obtenerConfiguracion(int idModo) {
        return switch (idModo) {
            case 1 -> obtenerConfiguracion("facil");
            case 2 -> obtenerConfiguracion("intermedio");
            case 3 -> obtenerConfiguracion("dificil");
            default -> throw new IllegalArgumentException("ID de modo inválido: " + idModo);
        };
    }
}
