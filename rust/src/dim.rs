pub mod events_recv;
pub mod events_sent;

pub fn with_action(action: &str, data: String) -> String {
    let mut res = format!("{{\"action\": \"{}\"", action).to_owned();

    if data.is_empty() {
        res.push_str("}");
    } else {
        res.push_str(", ");
        res.push_str(&data[1..]);
    }

    res.to_string()
}
