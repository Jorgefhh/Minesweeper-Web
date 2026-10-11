package backend.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import backend.dto.PartidaCreada;
import backend.dto.StatsRequest;
import backend.dto.StatsResponse;
import backend.model.Clasificacion;
import backend.model.ClasificacionId;
import backend.model.Estado;
import backend.model.Juego;
import backend.model.Partida;
import backend.model.Usuario;
import backend.repository.ClasificacionRepository;
import backend.repository.PartidaRepository;
import backend.repository.UsuarioRepository;

@Service
public class PartidaService {
    private final PartidaRepository partidaRepository;
    private final LogicaService logicaService;
    private final UsuarioRepository usuarioRepository;
    private final ClasificacionRepository clasificacionRepository;

    public PartidaService(PartidaRepository partidaRepository, LogicaService logicaService,
            UsuarioRepository usuarioRepository, ClasificacionRepository clasificacionRepository) {
        this.partidaRepository = partidaRepository;
        this.logicaService = logicaService;
        this.usuarioRepository = usuarioRepository;
        this.clasificacionRepository = clasificacionRepository;
    }

    // Este metodo tiene como finalidad guardar en la base de datos, algunos
    // atributos iniciales para preparar la partida.
    public PartidaCreada registrarPartida(Usuario usuario, String dificultad) {
        int modo = switch (dificultad.toLowerCase()) {
            case "facil" -> 1;
            case "intermedio" -> 2;
            case "dificil" -> 3;
            default ->
                throw new IllegalArgumentException("La dificultad ingresada no es inválida para registrar la partida");
        };

        Partida partida = new Partida();
        partida.setUsuarioId(usuario.getIdUsuarios());
        partida.setFechaPartida(Instant.now()); // Variable que guarda la fecha en formato UTC.
        partida.setTiempo(0.0);
        partida.setEstado(Estado.EN_CURSO);
        partida.setClickIzq(0);
        partida.setClickDer(0);
        partida.setIdModo(modo); // Como resuelvo esto
        List<Integer> semillas = SeedService.crearSemillas(dificultad);
        partida.setSemillas(semillas);
        // finalmente guardo la partida en la base de datos:
        Partida partidaCreada = partidaRepository.save(partida);

        PartidaCreada dto = new PartidaCreada(partidaCreada.getId(), semillas);
        return dto;
    }

    public StatsResponse validarPartida(Usuario usuario, StatsRequest stats) {
        Partida partida = partidaRepository.findById(stats.getIdPartida())
                // Si el registro con id de la partida asociado coincide con el user id
                // Y además la partida no está Ganada o perdida, entonces proseguir:
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado."));
        // Solo partidas en curso serán analizadas:
        if ((partida.getUsuarioId() != usuario.getIdUsuarios()) || partida.getEstado() != Estado.EN_CURSO) {
            throw new RuntimeException("Partida no encontrada.");
        }
        Juego juego = logicaService.simularJuego(partida, stats);
        boolean respuesta = false;
        // CASO PARTIDA GANADA:
        if (juego.getEstado() == Estado.GANADA) {
            Instant fin = Instant.now();
            Duration diferencia = Duration.between(partida.getFechaPartida(), fin);
            // Este realmente es el tiempo con mucho overhead
            partida.setEstado(Estado.GANADA);
            partida.setTiempo(diferencia.toMillis() / 1000.0); // Milisegundos a segundos
            partida.setClickDer(juego.getClicksDerechos());
            partida.setClickIzq(juego.getClicksIzquierdos());
            // Finalmente se persiste el objeto en la base de datos:
            partidaRepository.save(partida);

             // Si partida es un record personal, solo para el caso de haberla ganada:
            System.out.println("Ahora a guardar el record");
            respuesta = guardarRecord(partida); 
        }
        // CASO PARTIDA PERDIDA: solo marcar estado y no guardar todo.
        else {
            // GRAVE PROBLEMA: AHORA SI GUARDO PARTIDAS PERDIDAS,
            // NO PODRE DISCERNIR ENTRE PARTIDA PERDIDA REAL O PARTIDA MANIPULADA
            // Problema del futuro

            partida.setEstado(Estado.PERDIDA);
            partidaRepository.save(partida);
        }
        // AHORA SUMAR LA EXPERIENCIA AL USUARIO Y PERSISTIR TABLA USER
        // Primero calcular la experiencia.
        int orden = juego.getTablero().getColumnas() * juego.getTablero().getFilas();
        int exp = (juego.getAciertos() * juego.getAciertos()) / orden;
        if (juego.getEstado().equals(Estado.GANADA))
            exp *= 1.5; // En caso de ganar obtiene un plus de x1.5

        // Agregar la exp a la tabla usuarios:
        if (exp > 0) {
            usuarioRepository.acumularExperiencia(usuario.getIdUsuarios(), exp);
        }

        
       
        // Retornar el objeto DTO de salida:

        // Quizás después aquí debería hacer un procedimiento para actualizar la tabla
        // global
        return new StatsResponse(
                juego.getClicksIzquierdos(),
                juego.getClicksDerechos(),
                partida.getTiempo(),
                exp, respuesta);
    }

    // Método para guardarRecord.
    public boolean guardarRecord(Partida partida) {
        // Primero creo la clave compuesta:
        ClasificacionId id = new ClasificacionId(partida.getUsuarioId(), partida.getIdModo());
        // Primero veo si en la base de datos existe una clasificacion de ese usuario
        Optional<Clasificacion> c = clasificacionRepository.findById(id);
        if (c.isEmpty()) {
            // Entonces la lleno por primera vez:
            System.out.println("Lleno por primera vez.");
            Clasificacion clasificacion = new Clasificacion(
                    id,
                    partida.getTiempo(),
                    partida.getFechaPartida());

            clasificacionRepository.save(clasificacion);
            // Tener cuidado con spring data
            /*
             * Si @Id es null → piensa que es una entidad nueva → hace INSERT
             * Si @Id no es null → piensa que ya existe → hace UPDATE
             */
            // Algun mensaje o algo en especial.
            return true;
        } else {
            // Obtengo el objeto dentro del optional:
            Clasificacion clasificacion = c.get();
            if (partida.getTiempo() < clasificacion.getMejorTiempo()) {
                // Entonces hagase el reemplazo:
                clasificacion.setId(id);
                clasificacion.setFechaRecord(partida.getFechaPartida());
                clasificacion.setMejorTiempo(partida.getTiempo());
                // Lo mando a jdbc:
                clasificacionRepository.save(clasificacion);
                return true;
            }
            return false;
        }
    }
}
