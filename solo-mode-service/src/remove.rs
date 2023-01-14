#[cfg(windows)]
fn main() -> windows_service::Result<()> {
    use std::{thread, time::Duration};
    use windows_service::{
        service::{ServiceAccess, ServiceState},
        service_manager::{ServiceManager, ServiceManagerAccess},
    };

    let manager_access = ServiceManagerAccess::CONNECT;
    let service_manager = ServiceManager::local_computer(None::<&str>, manager_access)?;

    let service_access = ServiceAccess::QUERY_STATUS | ServiceAccess::STOP | ServiceAccess::DELETE;
    let service = service_manager.open_service("sd_solo_enabler", service_access);

    if service.is_err() {
        println!("Destiny 2 Solo Enabler > the service was already deleted");
        return Ok(());
    }

    let service = service.unwrap();

    loop {
        let service_status = service.query_status()?;
        if service_status.current_state != ServiceState::Stopped {
            service.stop()?;
            thread::sleep(Duration::from_secs(1));
        } else {
            break;
        }
    }

    service.delete()?;

    println!("Destiny 2 Solo Enabler > service deleted successfully");

    Ok(())
}

#[cfg(not(windows))]
fn main() {
    panic!("This program is only intended to run on Windows.");
}
