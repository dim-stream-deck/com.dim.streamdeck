use std::ffi::OsStr;

#[cfg(windows)]
fn main() -> windows_service::Result<()> {
    use std::ffi::OsString;
    use windows_service::{
        service::{ServiceAccess, ServiceErrorControl, ServiceInfo, ServiceStartType, ServiceType},
        service_manager::{ServiceManager, ServiceManagerAccess},
    };

    let mut service_binary_path = dirs::config_dir().unwrap();

    service_binary_path.push("sd-solo-mode.exe");

    let manager_access = ServiceManagerAccess::CONNECT | ServiceManagerAccess::CREATE_SERVICE;
    let service_manager: ServiceManager =
        ServiceManager::local_computer(None::<&str>, manager_access)?;

    print!("Destiny 2 Solo Enabler > installing service... ");

    let service_info = ServiceInfo {
        name: OsString::from("sd_solo_enabler"),
        display_name: OsString::from("Stream Deck Solo Enabler"),
        service_type: ServiceType::OWN_PROCESS,
        start_type: ServiceStartType::AutoStart,
        error_control: ServiceErrorControl::Normal,
        executable_path: service_binary_path,
        launch_arguments: vec![],
        dependencies: vec![],
        account_name: None,
        account_password: None,
    };

    let service = service_manager.open_service("sd_solo_enabler", ServiceAccess::START);

    if service.is_err() {
        let service =
            service_manager.create_service(&service_info, ServiceAccess::CHANGE_CONFIG)?;
        service.set_description(
            "https://github.com/dim-stream-deck/com.dim.streamdeck/wiki/Solo-Mode-(Action)",
        )?;
    }

    let service = service_manager.open_service(
        "sd_solo_enabler",
        ServiceAccess::START | ServiceAccess::QUERY_STATUS,
    )?;

    if service.query_status()?.current_state != windows_service::service::ServiceState::Running {
        service.start(&[OsStr::new("")])?;
    }

    println!("Destiny 2 Solo Enabler > service installed and started successfully");

    Ok(())
}
