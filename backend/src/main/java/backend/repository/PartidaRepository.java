package backend.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import backend.model.Partida;

@Repository
public interface PartidaRepository extends CrudRepository<Partida, Integer> {
}
