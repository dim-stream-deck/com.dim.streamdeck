use std::process::Command;

fn are_rules_enabled() -> bool {
    let child = Command::new("cmd")
        .args([
            "/C",
            "netsh advfirewall firewall show rule name=stream-deck-destiny-solo",
        ])
        .status();
    match child {
        Ok(exit_code) => exit_code.code() == Some(0),
        Err(_e) => false,
    }
}

fn run_command(cmd: &str) -> bool {
    let child = Command::new("cmd").args(["/C", cmd]).status();
    match child {
        Ok(exit_code) => exit_code.code() == Some(0),
        Err(_e) => false,
    }
}

fn enable(dir: &str, protocol: &str) -> bool {
    let child = Command::new("cmd")
        .args([
            "/C",
            &format!( "netsh advfirewall firewall add rule name=stream-deck-destiny-solo dir={} action=block protocol={} remoteport=27000-27202,3097", dir, protocol)
        ])
        .status();
    match child {
        Ok(exit_code) => exit_code.code() == Some(0),
        Err(_e) => false,
    }
}

fn disable() -> bool {
    !run_command("netsh advfirewall firewall delete rule name=stream-deck-destiny-solo")
}

fn toggle() -> bool {
    match are_rules_enabled() {
        true => disable(),
        false => {
            let commands = vec![
                enable("IN", "TCP"),
                enable("IN", "UDP"),
                enable("OUT", "TCP"),
                enable("OUT", "UDP"),
            ];
            commands.iter().all(|&x| x == true)
        }
    }
}

#[cfg(not(windows))]
fn main() {
    panic!("This program is only intended to run on Windows.");
}

#[cfg(windows)]
fn main() -> windows_service::Result<()> {
    solo_enabler_service::run()
}

#[cfg(windows)]
mod solo_enabler_service {
    use std::{ffi::OsString, time::Duration};

    use rouille::{Response, Server};
    use windows_service::service_control_handler::ServiceControlHandlerResult::NoError;
    use windows_service::{
        define_windows_service,
        service::{
            ServiceControl, ServiceControlAccept, ServiceExitCode, ServiceState, ServiceStatus,
            ServiceType,
        },
        service_control_handler::{self, ServiceControlHandlerResult},
        service_dispatcher, Result,
    };

    use crate::{are_rules_enabled, disable, toggle};

    const SERVICE_NAME: &str = "destiny_solo_enabler";
    const SERVICE_TYPE: ServiceType = ServiceType::OWN_PROCESS;

    pub fn run() -> Result<()> {
        service_dispatcher::start(SERVICE_NAME, ffi_service_main)
    }

    define_windows_service!(ffi_service_main, my_service_main);

    pub fn my_service_main(_arguments: Vec<OsString>) {
        if let Err(e) = run_service() {
            println!("Error: {:?}", e);
        }
    }

    fn run_service() -> Result<()> {
        let server = Server::new("localhost:9121", |request| {
            match request.get_param("action").unwrap_or_default().as_str() {
                "toggle" => Response::text(toggle().to_string()),
                "disable" => {
                    if are_rules_enabled() {
                        Response::text(disable().to_string())
                    } else {
                        Response::text("false".to_owned())
                    }
                }
                "status" => Response::text(are_rules_enabled().to_string()),
                _ => Response::text("stream-deck-destiny-solo"),
            }
        })
        .unwrap();

        let (handle, sender) = server.stoppable();

        let event_handler = move |control_event| -> ServiceControlHandlerResult {
            match control_event {
                ServiceControl::Interrogate => NoError,
                ServiceControl::Shutdown => NoError,
                ServiceControl::Stop => {
                    sender.send(()).unwrap();
                    NoError
                }
                _ => ServiceControlHandlerResult::NotImplemented,
            }
        };

        let status_handle = service_control_handler::register(SERVICE_NAME, event_handler)?;

        // Tell the system that service is running
        status_handle.set_service_status(ServiceStatus {
            service_type: SERVICE_TYPE,
            current_state: ServiceState::Running,
            controls_accepted: ServiceControlAccept::STOP | ServiceControlAccept::SHUTDOWN,
            exit_code: ServiceExitCode::Win32(0),
            checkpoint: 0,
            wait_hint: Duration::default(),
            process_id: None,
        })?;

        handle.join().unwrap();

        status_handle.set_service_status(ServiceStatus {
            service_type: SERVICE_TYPE,
            current_state: ServiceState::Stopped,
            controls_accepted: ServiceControlAccept::empty(),
            exit_code: ServiceExitCode::Win32(0),
            checkpoint: 0,
            wait_hint: Duration::default(),
            process_id: None,
        })?;

        Ok(())
    }
}
