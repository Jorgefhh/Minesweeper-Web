package backend.dto;

import java.util.List;

public record PartidaCreada(int idPartida, List<Integer> semillas) {}
//Entonces aquí tenemos un DTO, es un contrato entre el frontend y el backend.
