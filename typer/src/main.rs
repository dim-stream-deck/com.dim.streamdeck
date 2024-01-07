use enigo::*;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let mut enigo = Enigo::new();
    let command = &args[1];
    if command.contains("#") {
        enigo.key_sequence(&command);
    }
}
